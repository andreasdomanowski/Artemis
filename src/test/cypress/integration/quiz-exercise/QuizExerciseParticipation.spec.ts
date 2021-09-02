import { artemis } from '../../support/ArtemisTesting';
import { generateUUID } from '../../support/utils';
import shortAnswerQuizTemplate from '../../fixtures/quiz_exercise_fixtures/shortAnswerQuiz_template.json';
import dayjs from 'dayjs';

// Accounts
const admin = artemis.users.getAdmin();
const student = artemis.users.getStudentOne();

// Requests
const courseManagementRequest = artemis.requests.courseManagement;

// Page objects
const multipleChoiceQuiz = artemis.pageobjects.multipleChoiceQuiz;
const shortAnswerQuiz = artemis.pageobjects.shortAnswerQuiz;

// Common primitives
let uid: string;
let courseName: string;
let courseShortName: string;
let quizExerciseName: string;
let course: any;
let quizExercise: any;

describe('Quiz Exercise Management', () => {
    before('Set up course', () => {
        uid = generateUUID();
        courseName = 'Cypress course' + uid;
        courseShortName = 'cypress' + uid;
        cy.login(admin);
        courseManagementRequest.createCourse(courseName, courseShortName).then((response) => {
            course = response.body;
            courseManagementRequest.addStudentToCourse(course.id, student.username);
        });
    });

    beforeEach('Generate names', () => {
        uid = generateUUID();
        quizExerciseName = 'Cypress Quiz ' + uid;
    });

    afterEach('Delete Quiz', () => {
        cy.login(admin);
        courseManagementRequest.deleteQuizExercise(quizExercise.id);
    });

    after('Delete Course', () => {
        cy.login(admin);
        courseManagementRequest.deleteCourse(course.id);
    });

    describe('Quiz exercise participation', () => {
        beforeEach('Create quiz exercise', () => {
            createQuiz();
        });

        it('Student cannot see hidden quiz', () => {
            cy.login(student, '/courses/' + course.id);
            cy.contains('No exercises available for the course.').should('be.visible');
        });

        it('Student can see a visible quiz', () => {
            courseManagementRequest.setQuizVisible(quizExercise.id);
            cy.login(student, '/courses/' + course.id);
            cy.contains(quizExercise.title).scrollIntoView().click();
            cy.get('.btn').contains('Open quiz').click();
            cy.get('.quiz-waiting-for-start-overlay > span').should('contain.text', 'This page will refresh automatically, when the quiz starts.');
        });

        it('Student can participate in MC quiz', () => {
            courseManagementRequest.setQuizVisible(quizExercise.id);
            courseManagementRequest.startQuizNow(quizExercise.id);
            cy.login(student, '/courses/' + course.id);
            cy.contains(quizExercise.title).scrollIntoView().click();
            cy.get('.btn').contains('Start quiz').click();
            multipleChoiceQuiz.tickAnswerOption(0);
            multipleChoiceQuiz.tickAnswerOption(2);
            multipleChoiceQuiz.submit();
            cy.get('[jhitranslate="artemisApp.quizExercise.successfullySubmittedText"]').should('be.visible');
        });
    });

    describe('SA quiz participation', () => {
        before('Create SA quiz', () => {
            createQuiz([shortAnswerQuizTemplate]).then(() => {
                courseManagementRequest.setQuizVisible(quizExercise.id);
                courseManagementRequest.startQuizNow(quizExercise.id);
            });
        });

        it('Student can participate in SA quiz', () => {
            cy.login(student, '/courses/' + course.id);
            cy.contains(quizExercise.title).scrollIntoView().click();
            cy.get('.btn').contains('Start quiz').click();
            shortAnswerQuiz.typeAnswer( 0, 'give');
            shortAnswerQuiz.typeAnswer( 1, 'let');
            shortAnswerQuiz.typeAnswer( 2, 'run');
            shortAnswerQuiz.typeAnswer( 3, 'desert');
            shortAnswerQuiz.typeAnswer( 4, 'cry');
            shortAnswerQuiz.typeAnswer( 5, 'goodbye');
            shortAnswerQuiz.submit();
        });
    });
});

function createQuiz(quizQuestions?: any) {
    cy.login(admin);
    return courseManagementRequest.createQuizExercise({ course }, quizExerciseName, dayjs().subtract(1, 'minute'), quizQuestions).then((quizResponse) => {
            quizExercise = quizResponse.body;
    });
}