import { POST, BASE_API } from '../../constants';
import { CypressExerciseType } from '../../requests/CourseManagementRequests';
import { AbstractExerciseAssessmentPage } from './AbstractExerciseAssessmentPage';

/**
 * A class which encapsulates UI selectors and actions for the text exercise assessment page.
 */
export class TextExerciseAssessmentPage extends AbstractExerciseAssessmentPage {
    readonly feedbackEditorSelector = 'jhi-textblock-feedback-editor';

    getInstructionsRootElement() {
        // Text exercise assessment pages don't have the id on the instructions tab, so we override the parent selector
        cy.url().should('contain', '/assessment');
        return cy.contains('Instructions').parents('.card');
    }

    provideFeedbackOnTextSection(section: string, points: number, feedback: string) {
        cy.contains(section).parents('jhi-textblock-assessment-card').first().click();
        this.typeIntoFeedbackEditor(feedback);
        this.typePointsIntoFeedbackEditor(points);
    }

    private typeIntoFeedbackEditor(text: string) {
        cy.get(this.feedbackEditorSelector).find('textarea').type(text, { parseSpecialCharSequences: false });
    }

    private typePointsIntoFeedbackEditor(points: number) {
        cy.get(this.feedbackEditorSelector).find('[type="number"]').clear().type(points.toString());
    }

    submit() {
        // Feedback route is special for text exercises so we override parent here...
        cy.intercept(POST, BASE_API + 'participations/*/results/*/submit-text-assessment').as('submitFeedback');
        cy.get('[jhitranslate="entity.action.submit"]').click();
        cy.contains('Your assessment was submitted successfully!').should('be.visible');
        return cy.wait('@submitFeedback');
    }

    rejectComplaint(response: string) {
        return super.rejectComplaint(response, CypressExerciseType.TEXT);
    }

    acceptComplaint(response: string) {
        return super.acceptComplaint(response, CypressExerciseType.TEXT);
    }
}
