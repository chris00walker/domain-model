import { DomainEvent } from '../../../shared/domain/events/DomainEvent';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { ModerationTask } from '../aggregates/ModerationTask';

/**
 * ModerationTaskCompletedEvent
 * 
 * Domain event emitted when a moderation task is completed (approved or rejected).
 */
export class ModerationTaskCompletedEvent extends DomainEvent {
  public moderationTask: ModerationTask;

  constructor(moderationTask: ModerationTask) {
    super({
      aggregateId: moderationTask.id.toString()
    });
    this.moderationTask = moderationTask;
  }

  toPrimitives(): any {
    return {
      moderationTaskId: this.moderationTask.id.toString(),
      contentType: this.moderationTask.contentType,
      status: this.moderationTask.status.value
    };
  }
}
