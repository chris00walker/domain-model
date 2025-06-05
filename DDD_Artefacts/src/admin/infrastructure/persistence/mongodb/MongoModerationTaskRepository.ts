import { MongoClient, ObjectId } from 'mongodb';
import { ModerationTask, ContentType } from '../../../domain/aggregates/ModerationTask';
import { IModerationTaskRepository } from '../../../domain/repositories/IModerationTaskRepository';
import { ModerationStatus, ModerationStatusValue } from '../../../domain/value-objects/ModerationStatus';
import { UniqueEntityID } from '../../../../../shared/domain/UniqueEntityID';
import { BaseMongoRepository } from './BaseMongoRepository';

/**
 * MongoDB implementation of the ModerationTask repository
 */
export class MongoModerationTaskRepository extends BaseMongoRepository<ModerationTask> implements IModerationTaskRepository {
  
  constructor(client: MongoClient, dbName: string) {
    super(client, dbName, 'moderation_tasks');
  }

  /**
   * Maps a domain ModerationTask to a MongoDB document
   */
  protected toPersistence(task: ModerationTask): any {
    return {
      contentType: task.contentType,
      contentId: task.contentId.toString(),
      status: task.status.value,
      contentData: task.contentData,
      moderationNotes: task.moderationNotes,
      moderatedById: task.moderatedById ? task.moderatedById.toString() : undefined,
      moderatedAt: task.moderatedAt,
      aiSuggestion: task.aiSuggestion,
      aiConfidence: task.aiConfidence,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    };
  }

  /**
   * Maps a MongoDB document to a domain ModerationTask
   */
  protected toDomain(record: any): ModerationTask {
    const props = {
      contentType: record.contentType as ContentType,
      contentId: new UniqueEntityID(record.contentId),
      contentData: record.contentData || {},
      moderationNotes: record.moderationNotes,
      moderatedById: record.moderatedById ? new UniqueEntityID(record.moderatedById) : undefined,
      moderatedAt: record.moderatedAt ? new Date(record.moderatedAt) : undefined,
      aiSuggestion: record.aiSuggestion,
      aiConfidence: record.aiConfidence,
      status: ModerationStatus.create(record.status),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt)
    };
    
    const id = new UniqueEntityID(record._id.toString());
    return ModerationTask.create(props, id).getValue();
  }

  /**
   * Find a moderation task by content ID and type
   */
  async findByContentId(contentId: UniqueEntityID, contentType: ContentType): Promise<ModerationTask | null> {
    const record = await this.collection.findOne({ 
      contentId: contentId.toString(),
      contentType: contentType
    });
    
    if (!record) {
      return null;
    }
    
    return this.toDomain(record);
  }

  /**
   * Get all moderation tasks, with optional pagination
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<ModerationTask[]> {
    const records = await this.collection
      .find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get moderation tasks by status
   */
  async findByStatus(status: ModerationStatusValue, limit: number = 100, offset: number = 0): Promise<ModerationTask[]> {
    const records = await this.collection
      .find({ status })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get pending tasks that require human review
   */
  async findTasksRequiringReview(limit: number = 100, offset: number = 0): Promise<ModerationTask[]> {
    const records = await this.collection
      .find({
        $or: [
          { status: ModerationStatusValue.PENDING },
          { status: ModerationStatusValue.FLAGGED }
        ]
      })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }

  /**
   * Get tasks by content type
   */
  async findByContentType(contentType: ContentType, limit: number = 100, offset: number = 0): Promise<ModerationTask[]> {
    const records = await this.collection
      .find({ contentType })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }

  /**
   * Count moderation tasks by status
   */
  async countByStatus(status: ModerationStatusValue): Promise<number> {
    return this.collection.countDocuments({ status });
  }

  /**
   * Count tasks requiring human review
   */
  async countTasksRequiringReview(): Promise<number> {
    return this.collection.countDocuments({
      $or: [
        { status: ModerationStatusValue.PENDING },
        { status: ModerationStatusValue.FLAGGED }
      ]
    });
  }
}
