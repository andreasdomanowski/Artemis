import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ComplaintService } from 'app/complaints/complaint.service';
import { Result } from 'app/entities/result.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Complaint, ComplaintType } from 'app/entities/complaint.model';
import { Exercise } from 'app/entities/exercise.model';
import { onError } from 'app/shared/util/global.utils';
import { AlertService } from 'app/core/util/alert.service';

@Component({
    selector: 'jhi-complaint-form',
    templateUrl: './complaints-form.component.html',
    styleUrls: ['./complaints-form.component.scss'],
})
export class ComplaintsFormComponent implements OnInit {
    @Input() exercise: Exercise;
    @Input() resultId: number;
    @Input() examId?: number;
    @Input() allowedComplaints: number; // the number of complaints that a student can still submit in the course
    @Input() complaintType: ComplaintType;
    @Input() isCurrentUserSubmissionAuthor = false;
    @Output() submit: EventEmitter<void> = new EventEmitter();
    maxComplaintsPerCourse: number;
    complaintText?: string;
    ComplaintType = ComplaintType;

    constructor(private complaintService: ComplaintService, private alertService: AlertService) {}

    ngOnInit(): void {
        if (this.exercise.course) {
            this.maxComplaintsPerCourse = this.exercise.teamMode ? this.exercise.course.maxTeamComplaints! : this.exercise.course.maxComplaints!;
        } else {
            this.maxComplaintsPerCourse = 1;
        }
    }

    /**
     * Creates a new complaint on the provided result with the entered text and notifies the output emitter on success.
     */
    createComplaint(): void {
        const complaint = new Complaint();
        complaint.complaintText = this.complaintText;
        complaint.result = new Result();
        complaint.result.id = this.resultId;
        complaint.complaintType = this.complaintType;

        this.complaintService.create(complaint, this.examId).subscribe(
            () => {
                this.submit.emit();
            },
            (err: HttpErrorResponse) => {
                if (err?.error?.errorKey === 'tooManyComplaints') {
                    this.alertService.error('artemisApp.complaint.tooManyComplaints', { maxComplaintNumber: this.maxComplaintsPerCourse });
                } else {
                    onError(this.alertService, err);
                }
            },
        );
    }
}
