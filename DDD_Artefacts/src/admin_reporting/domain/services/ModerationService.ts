import { Result, success, failure } from '../../../shared/core/Result';
import { ModerationTask, ContentType } from '../aggregates/ModerationTask';
import { IModerationTaskRepository } from '../repositories/IModerationTaskRepository';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { IAuditLogService } from './IAuditLogService';
import { ModerationStatusValue } from '../value-objects/ModerationStatus';

/**
 * ModerationService
 * 
 * Domain service for managing content moderation workflow.
 */
export class ModerationService {
  private moderationTaskRepository: IModerationTaskRepository;
  private auditLogService: IAuditLogService;
  
  constructor(
    moderationTaskRepository: IModerationTaskRepository,
    auditLogService: IAuditLogService
  ) {
    this.moderationTaskRepository = moderationTaskRepository;
    this.auditLogService = auditLogService;
  }
  
  /**
   * Creates a new moderation task for content that needs approval
   */
  public async createModerationTask(
    contentType: ContentType,
    contentId: string,
    contentData: Record<string, any>
  ): Promise<Result<ModerationTask>> {
    // Check if task already exists for this content
    const existingTask = await this.moderationTaskRepository.findByContentId(
      new UniqueEntityID(contentId),
      contentType
    );
    
    if (existingTask) {
      return failure(new Error('A moderation task already exists for this content'));
    }
    
    // Create moderation task
    const taskOrError = ModerationTask.create({
      contentType,
      contentId: new UniqueEntityID(contentId),
      contentData
    });
    
    if (taskOrError.isFailure()) {
      return failure(taskOrError.getErrorValue());
    }
    
    const task = taskOrError.getValue();
    
    // Save task
    await this.moderationTaskRepository.save(task);
    
    return success(task);
  }
  
  /**
   * Approve content
   */
  public async approveContent(
    taskId: string,
    moderatorId: string,
    notes?: string
  ): Promise<Result<void>> {
    // Get task
    const task = await this.moderationTaskRepository.findById(new UniqueEntityID(taskId));
    if (!task) {
      return failure(new Error('Moderation task not found'));
    }
    
    // Approve task
    const result = task.approve(new UniqueEntityID(moderatorId), notes);
    if (result.isFailure()) {
      return failure(result.getErrorValue());
    }
    
    // Save task
    await this.moderationTaskRepository.save(task);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: 'CONTENT_APPROVED',
      performedBy: new UniqueEntityID(moderatorId),
      targetId: new UniqueEntityID(taskId),
      details: {
        contentType: task.contentType,
        contentId: task.contentId.toString(),
        notes: notes || 'No notes provided'
      }
    });
    
    return success(undefined);
  }
  
  /**
   * Reject content
   */
  public async rejectContent(
    taskId: string,
    moderatorId: string,
    notes: string
  ): Promise<Result<void>> {
    // Get task
    const task = await this.moderationTaskRepository.findById(new UniqueEntityID(taskId));
    if (!task) {
      return failure(new Error('Moderation task not found'));
    }
    
    // Reject task
    const result = task.reject(new UniqueEntityID(moderatorId), notes);
    if (result.isFailure()) {
      return failure(result.getErrorValue());
    }
    
    // Save task
    await this.moderationTaskRepository.save(task);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: 'CONTENT_REJECTED',
      performedBy: new UniqueEntityID(moderatorId),
      targetId: new UniqueEntityID(taskId),
      details: {
        contentType: task.contentType,
        contentId: task.contentId.toString(),
        notes
      }
    });
    
    return success(undefined);
  }
  
  /**
   * Flag content for additional review
   */
  public async flagContent(
    taskId: string,
    moderatorId: string,
    notes: string
  ): Promise<Result<void>> {
    // Get task
    const task = await this.moderationTaskRepository.findById(new UniqueEntityID(taskId));
    if (!task) {
      return failure(new Error('Moderation task not found'));
    }
    
    // Flag task
    const result = task.flag(new UniqueEntityID(moderatorId), notes);
    if (result.isFailure()) {
      return failure(result.getErrorValue());
    }
    
    // Save task
    await this.moderationTaskRepository.save(task);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: 'CONTENT_FLAGGED',
      performedBy: new UniqueEntityID(moderatorId),
      targetId: new UniqueEntityID(taskId),
      details: {
        contentType: task.contentType,
        contentId: task.contentId.toString(),
        notes
      }
    });
    
    return success(undefined);
  }
  
  /**
   * Apply AI moderation suggestion to a task
   */
  public async applyAiModeration(
    taskId: string,
    suggestion: ModerationStatusValue,
    confidence: number
  ): Promise<Result<boolean>> {
    // Get task
    const task = await this.moderationTaskRepository.findById(new UniqueEntityID(taskId));
    if (!task) {
      return failure(new Error('Moderation task not found'));
    }
    
    // Check if task already completed
    if (task.isComplete) {
      return failure(new Error('Task has already been processed'));
    }
    
    // Apply AI suggestion
    const result = task.setAiSuggestion(suggestion, confidence);
    if (result.isFailure()) {
      return failure(result.getErrorValue());
    }
    
    // Save task
    await this.moderationTaskRepository.save(task);
    
    // Return whether auto-approval was applied
    const wasAutoApproved = task.status.value === ModerationStatusValue.AUTO_APPROVED;
    
    // Log action if auto-approved
    if (wasAutoApproved) {
      await this.auditLogService.logAction({
        actionType: 'CONTENT_AUTO_APPROVED',
        performedBy: new UniqueEntityID('system'), // System ID
        targetId: new UniqueEntityID(taskId),
        details: {
          contentType: task.contentType,
          contentId: task.contentId.toString(),
          confidence
        }
      });
    }
    
    return success(wasAutoApproved);
  }
  
  /**
   * Get summary of moderation tasks by status
   */
  public async getModerationSummary(): Promise<Record<string, number>> {
    const summary: Record<string, number> = {};
    
    // Count for each status
    for (const status of Object.values(ModerationStatusValue)) {
      summary[status] = await this.moderationTaskRepository.countByStatus(status);
    }
    
    // Add total requiring review
    summary['REQUIRES_REVIEW'] = await this.moderationTaskRepository.countTasksRequiringReview();
    
    return summary;
  }
  
  /**
   * Moderate a task by changing its status
   */
  public async moderateTask(
    taskId: string,
    newStatus: ModerationStatusValue,
    moderatorId: string,
    notes?: string
  ): Promise<Result<ModerationTask>> {
    // Get task
    const task = await this.moderationTaskRepository.findById(new UniqueEntityID(taskId));
    if (!task) {
      return failure(new Error('Moderation task not found'));
    }
    
    let result: Result<void>;
    
    // Apply the appropriate moderation action based on new status
    switch (newStatus) {
      case ModerationStatusValue.APPROVED:
        result = task.approve(new UniqueEntityID(moderatorId), notes);
        break;
      case ModerationStatusValue.REJECTED:
        if (!notes) {
          return failure(new Error('Rejection notes are required'));
        }
        result = task.reject(new UniqueEntityID(moderatorId), notes);
        break;
      case ModerationStatusValue.FLAGGED:
        if (!notes) {
          return failure(new Error('Flagging notes are required'));
        }
        result = task.flag(new UniqueEntityID(moderatorId), notes);
        break;
      default:
        return failure(new Error(`Cannot change status to ${newStatus} via moderation`));
    }
    
    if (result.isFailure()) {
      return failure(result.getErrorValue());
    }
    
    // Save task
    await this.moderationTaskRepository.save(task);
    
    // Log action
    await this.auditLogService.logAction({
      actionType: `CONTENT_${newStatus}`,
      performedBy: new UniqueEntityID(moderatorId),
      targetId: new UniqueEntityID(taskId),
      details: {
        contentType: task.contentType,
        contentId: task.contentId.toString(),
        notes: notes || 'No notes provided'
      }
    });
    
    return success(task);
  }
  
  /**
   * Get pending tasks that require review
   */
  public async getPendingTasks(
    limit: number = 100,
    offset: number = 0
  ): Promise<Result<ModerationTask[]>> {
    try {
      const tasks = await this.moderationTaskRepository.findTasksRequiringReview(limit, offset);
      return success(tasks);
    } catch (error: any) {
      return failure(error instanceof Error ? error : new Error(`Failed to get pending tasks: ${error}`));
    }
  }
  
  /**
   * Count pending tasks that require review
   */
  public async countPendingTasks(): Promise<Result<number>> {
    try {
      const count = await this.moderationTaskRepository.countTasksRequiringReview();
      return success(count);
    } catch (error: any) {
      return failure(error instanceof Error ? error : new Error(`Failed to count pending tasks: ${error}`));
    }
  }
}
