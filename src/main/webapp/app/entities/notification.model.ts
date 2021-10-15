import dayjs from 'dayjs';
import { BaseEntity } from 'app/shared/model/base-entity';
import { User } from 'app/core/user/user.model';

export enum NotificationType {
    SYSTEM = 'system',
    CONNECTION = 'connection',
    GROUP = 'group',
    SINGLE = 'single',
}

export class Notification implements BaseEntity {
    public id?: number;
    public notificationType?: NotificationType;
    public title?: string;
    public text?: string;
    public notificationDate?: dayjs.Dayjs;
    public target?: string;
    public author?: User;

    protected constructor(notificationType: NotificationType) {
        this.notificationType = notificationType;
    }
}

/**
 * Corresponds to the server-side NotificationTitleTypeConstants(.java) constant Strings
 */
export const ATTACHMENT_CHANGE_TITLE = 'Attachment updated';

export const EXERCISE_CREATED_TITLE = 'Exercise created';

export const EXERCISE_PRACTICE_TITLE = 'Exercise open for practice';

export const QUIZ_EXERCISE_STARTED_TITLE = 'Quiz started';

export const EXERCISE_UPDATED_TITLE = 'Exercise updated';

export const DUPLICATE_TEST_CASE_TITLE = 'Duplicate test case was found.';

export const ILLEGAL_SUBMISSION_TITLE = 'Illegal submission of a student.';

export const NEW_POST_FOR_EXERCISE_TITLE = 'New Exercise Post';

export const NEW_POST_FOR_LECTURE_TITLE = 'New Lecture Post';

export const NEW_ANNOUNCEMENT_POST_TITLE = 'New Announcement';

export const NEW_COURSE_POST_TITLE = 'New Course-wide Post';

export const NEW_ANSWER_POST_FOR_EXERCISE_TITLE = 'New Exercise Reply';

export const NEW_ANSWER_POST_FOR_LECTURE_TITLE = 'New Lecture Reply';

export const COURSE_ARCHIVE_STARTED_TITLE = 'Course archival started';

export const COURSE_ARCHIVE_FINISHED_TITLE = 'Course archival finished';

export const COURSE_ARCHIVE_FAILED_TITLE = 'Course archival failed';

export const EXAM_ARCHIVE_STARTED_TITLE = 'Exam archival started';

export const EXAM_ARCHIVE_FINISHED_TITLE = 'Exam archival finished';

export const EXAM_ARCHIVE_FAILED_TITLE = 'Exam archival failed';

// edge case: has no separate notificationType. Is created based on EXERCISE_UPDATED for exam exercises
export const LIVE_EXAM_EXERCISE_UPDATE_NOTIFICATION_TITLE = 'Live Exam Exercise Update';
