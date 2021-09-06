import { PUT, BASE_API } from './../../constants';
/**
 * Parent class for all exercise assessment pages.
 */
export abstract class AbstractExerciseAssessmentPage {
    getInstructionsRootElement() {
        return cy.get('[jhitranslate="artemisApp.exercise.instructions"]').parents('.card');
    }

    addNewFeedback(points: number, feedback?: string) {
        cy.get('.btn-success').contains('Add new Feedback').click();
        cy.get('.col-lg-6 >>>> :nth-child(1) > :nth-child(2)').clear().type(points.toString());
        if (feedback) {
            cy.get('.col-lg-6 >>>> :nth-child(2) > :nth-child(2)').type(feedback);
        }
    }

    submit() {
        cy.intercept(PUT, BASE_API + 'participations/*/manual-results?submit=true').as('submitFeedback');
        cy.get('[jhitranslate="entity.action.submit"]').click();
        return cy.wait('@submitFeedback');
    }

    rejectComplaint(response: string) {
        return this.handleComplaint(response, false);
    }

    acceptComplaint(response: string) {
        return this.handleComplaint(response, true);
    }

    private handleComplaint(response: string, accept: boolean) {
        cy.get('tr > .text-center >').click();
        cy.get('#responseTextArea').type(response, { parseSpecialCharSequences: false });
        cy.intercept(PUT, BASE_API + 'participations/*/submissions/*/text-assessment-after-complaint').as('complaintAnswer');
        if (accept) {
            cy.get('#acceptComplaintButton').click();
        } else {
            cy.get('#rejectComplaintButton').click();
        }
        return cy.wait('@complaintAnswer');
    }
}
