import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgrammingExercise } from 'app/entities/programming-exercise.model';

/**
 * The actions of the submission policy configuration:
 * - Delete Submission Policy
 * - Update Submission Policy
 * - Enable/Disable Submission Policy
 */
@Component({
    selector: 'jhi-programming-exercise-grading-submission-policy-configuration-actions',
    template: `
        <button
            id="update-submission-policy-button"
            class="btn btn-primary ms-3 my-1"
            jhiTranslate="artemisApp.programmingExercise.submissionPolicy.update"
            (click)="onUpdate.emit()"
            [disabled]="isSaving"
        ></button>
        <button
            *ngIf="exercise.submissionPolicy && exercise.submissionPolicy!.active"
            id="deactivate-submission-policy-button"
            class="btn btn-danger ms-3 my-1"
            jhiTranslate="artemisApp.programmingExercise.submissionPolicy.deactivate"
            (click)="onToggle.emit()"
            [disabled]="isSaving"
        ></button>
        <button
            *ngIf="exercise.submissionPolicy && !exercise.submissionPolicy!.active"
            id="activate-submission-policy-button"
            class="btn btn-success ms-3 my-1"
            jhiTranslate="artemisApp.programmingExercise.submissionPolicy.activate"
            (click)="onToggle.emit()"
            [disabled]="isSaving"
        ></button>
        <button
            *ngIf="exercise.submissionPolicy"
            id="delete-submission-policy-button"
            class="btn btn-danger ms-3 my-1"
            jhiTranslate="artemisApp.programmingExercise.submissionPolicy.delete"
            (click)="onRemove.emit()"
            [disabled]="isSaving"
        ></button>
    `,
})
export class ProgrammingExerciseGradingSubmissionPolicyConfigurationActionsComponent {
    @Input() exercise: ProgrammingExercise;
    @Input() hasUnsavedChanges: boolean;
    @Input() isSaving: boolean;

    @Output() onUpdate = new EventEmitter();
    @Output() onToggle = new EventEmitter();
    @Output() onRemove = new EventEmitter();
}