import { Result, success, failure } from '../../../../shared/core/Result';
import { ModerationService } from '../../../domain/services/ModerationService';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { ModerationStatus, ModerationStatusValue } from '../../../domain/value-objects/ModerationStatus';

interface ModeratePendingTaskRequest {
  taskId: string;
  approved: boolean;
  moderatorId: string;
  notes?: string;
}

type ModeratePendingTaskResponse = Result<{
  taskId: string;
  contentId: string;
  contentType: string;
  status: string;
  moderatedById: string;
  moderatedAt: Date;
}, Error>;

/**
 * ModeratePendingTaskUseCase
 * 
 * Use case for approving or rejecting a pending moderation task
 */
export class ModeratePendingTaskUseCase {
  
  constructor(
    private readonly moderationService: ModerationService
  ) {}
  
  async execute(request: ModeratePendingTaskRequest): Promise<ModeratePendingTaskResponse> {
    try {
      // Create new status based on action
      const newStatus = request.approved 
        ? ModerationStatusValue.APPROVED 
        : ModerationStatusValue.REJECTED;
      
      // Update the task status via domain service
      const taskResult = await this.moderationService.moderateTask(
        request.taskId,
        newStatus,
        request.moderatorId,
        request.notes
      );
      
      if (taskResult.isFailure()) {
        return failure(taskResult.getErrorValue());
      }
      
      const task = taskResult.getValue();
      
      return success({
        taskId: task.id.toString(),
        contentId: task.contentId.toString(),
        contentType: task.contentType,
        status: task.status.value,
        moderatedById: task.moderatedById?.toString() || '',
        moderatedAt: task.moderatedAt || new Date()
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to moderate task: ${error.message || error}`));
    }
  }
}
