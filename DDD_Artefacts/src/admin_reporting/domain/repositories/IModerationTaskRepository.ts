import { ModerationTask, ContentType } from '../aggregates/ModerationTask';
import { ModerationStatusValue } from '../value-objects/ModerationStatus';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

/**
 * IModerationTaskRepository
 * 
 * Repository interface for managing content moderation tasks.
 */
export interface IModerationTaskRepository {
  /**
   * Find a moderation task by its unique ID
   */
  findById(id: UniqueEntityID): Promise<ModerationTask | null>;
  
  /**
   * Find a moderation task by content ID and type
   */
  findByContentId(contentId: UniqueEntityID, contentType: ContentType): Promise<ModerationTask | null>;
  
  /**
   * Get all moderation tasks, with optional pagination
   */
  findAll(limit?: number, offset?: number): Promise<ModerationTask[]>;
  
  /**
   * Get moderation tasks by status
   */
  findByStatus(status: ModerationStatusValue, limit?: number, offset?: number): Promise<ModerationTask[]>;
  
  /**
   * Get pending tasks that require human review
   */
  findTasksRequiringReview(limit?: number, offset?: number): Promise<ModerationTask[]>;
  
  /**
   * Get tasks by content type
   */
  findByContentType(contentType: ContentType, limit?: number, offset?: number): Promise<ModerationTask[]>;
  
  /**
   * Save a new or updated moderation task
   */
  save(moderationTask: ModerationTask): Promise<void>;
  
  /**
   * Count moderation tasks by status
   */
  countByStatus(status: ModerationStatusValue): Promise<number>;
  
  /**
   * Count tasks requiring human review
   */
  countTasksRequiringReview(): Promise<number>;
}
