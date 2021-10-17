import { BASE_API, POST, PUT } from '../../../support/constants';
import { artemis } from '../../../support/ArtemisTesting';
import day from 'dayjs';

// pageobjects
const assessmentEditor = artemis.pageobjects.modelingExercise.assessmentEditor;
const courseAssessmentDashboard = artemis.pageobjects.assessment.course;
const exerciseAssessmentDashboard = artemis.pageobjects.assessment.exercise;
// requests
const courseManagementRequests = artemis.requests.courseManagement;
// Users
const userManagement = artemis.users;
const admin = userManagement.getAdmin();
const student = userManagement.getStudentOne();
const tutor = userManagement.getTutor();
const instructor = userManagement.getInstructor();

let course: any;
let modelingExercise: any;

describe('Modeling Exercise Spec', () => {
    before('Log in as admin and create a course', () => {
        cy.login(admin);
        courseManagementRequests.createCourse().then((courseResp) => {
            course = courseResp.body;
            courseManagementRequests.addStudentToCourse(course.id, student.username);
            courseManagementRequests.addInstructorToCourse(course.id, instructor);
            courseManagementRequests.addTutorToCourse(course, tutor);
        });
    });

    before('Create modeling exercise and submission', () => {
        courseManagementRequests.createModelingExercise({ course }, undefined, undefined, day().add(5, 'seconds'), day().add(1, 'hour')).then((resp) => {
            modelingExercise = resp.body;
            cy.login(student);
            courseManagementRequests.startExerciseParticipation(course.id, modelingExercise.id).then((participationReponse: any) => {
                courseManagementRequests.makeModelingExerciseSubmission(modelingExercise.id, participationReponse.body);
            });
        });
    });

    after('Delete test course', () => {
        cy.login(admin);
        courseManagementRequests.deleteCourse(course.id);
    });

    it('Tutor can assess a submission', () => {
        cy.login(tutor, '/course-management');
        cy.get(`[href="/course-management/${course.id}/assessment-dashboard"]`).click();
        cy.url().should('contain', `/course-management/${course.id}/assessment-dashboard`);
        courseAssessmentDashboard.checkShowFinishedExercises();
        courseAssessmentDashboard.clickExerciseDashboardButton();
        exerciseAssessmentDashboard.clickHaveReadInstructionsButton();
        exerciseAssessmentDashboard.clickStartNewAssessment();
        cy.get('#assessmentLockedCurrentUser').should('contain.text', 'You have the lock for this assessment');
        assessmentEditor.addNewFeedback(1, 'Thanks, good job.');
        assessmentEditor.openAssessmentForComponent(1);
        assessmentEditor.assessComponent(-1, 'False');
        assessmentEditor.openAssessmentForComponent(2);
        assessmentEditor.assessComponent(2, 'Good');
        assessmentEditor.openAssessmentForComponent(3);
        assessmentEditor.assessComponent(0, 'Unnecessary');
        cy.intercept(PUT, BASE_API + 'modeling-submissions/*/result/*/assessment*').as('submitModelingAssessment');
        assessmentEditor.submit();
        cy.wait('@submitModelingAssessment').its('response.statusCode').should('eq', 200);
    });

    describe('Handling complaints', () => {
        before(() => {
            cy.login(admin);
            courseManagementRequests
                .updateModelingExerciseAssessmentDueDate(modelingExercise, day())
                .its('body')
                .then((exercise) => {
                    modelingExercise = exercise;
                });
            cy.login(student, `/courses/${course.id}/exercises/${modelingExercise.id}`);
        });

        it('Student can view the assessment and complain', () => {
            cy.login(student, `/courses/${course.id}/exercises/${modelingExercise.id}`);
            cy.get('jhi-submission-result-status > .col-auto').should('contain.text', 'Score').and('contain.text', '2 of 10 points');
            cy.get('jhi-exercise-details-student-actions.col > > :nth-child(2)').click();
            cy.url().should('contain', `/courses/${course.id}/modeling-exercises/${modelingExercise.id}/participate/`);
            cy.get('.col-xl-8').should('contain.text', 'Thanks, good job.');
            cy.get('jhi-complaint-interactions > :nth-child(1) > .mt-4 > :nth-child(1)').click();
            cy.get('#complainTextArea').type('Thanks i hate you :^)');
            cy.intercept(POST, BASE_API + 'complaints').as('complaintCreated');
            cy.get('.col-6 > .btn').click();
            cy.wait('@complaintCreated');
        });

        it('Instructor can see complaint and reject it', () => {
            cy.login(instructor, `/course-management/${course.id}/assessment-dashboard`);
            cy.get(`[href="/course-management/${course.id}/complaints"]`).click();
            cy.get('tr > .text-center >').click();
            cy.get('#responseTextArea').type('lorem ipsum...');
            cy.get('#rejectComplaintButton').click();
            cy.get('.alerts').should('contain.text', 'Response to complaint has been submitted');
        });
    });
});
