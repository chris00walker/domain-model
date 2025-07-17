import { AggregateRoot } from '../../../shared/domain/AggregateRoot';
import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result, success, failure } from '../../../shared/core/Result';
import { ModerationStatus, ModerationStatusValue } from '../value-objects/ModerationStatus';
import { ModerationTaskCompletedEvent } from '../events/ModerationTaskCompletedEvent';

/**
 * Content type enum for moderation tasks
 */
export enum ContentType {
  PRODUCT_REVIEW = 'PRODUCT_REVIEW',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  CUSTOMER_COMMENT = 'CUSTOMER_COMMENT',
  CUSTOMER_PROFILE = 'CUSTOMER_PROFILE',
  PRODUCT_IMAGE = 'PRODUCT_IMAGE',
  MARKETING_CONTENT = 'MARKETING_CONTENT'
}

interface ModerationTaskProps {
  contentType: ContentType;
  contentId: UniqueEntityID;
  status: ModerationStatus;
  contentData: Record<string, any>;
  moderationNotes?: string;
  moderatedById?: UniqueEntityID;
  moderatedAt?: Date;
  aiSuggestion?: ModerationStatusValue;
  aiConfidence?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * ModerationTask Aggregate Root
 * 
 * Represents a content moderation task that requires administrative review.
 * Manages the workflow of content approval or rejection.
 */
export class ModerationTask extends AggregateRoot<ModerationTaskProps> {
  
  get contentType(): ContentType {
    return this.props.contentType;
  }
  
  get contentId(): UniqueEntityID {
    return this.props.contentId;
  }
  
  get status(): ModerationStatus {
    return this.props.status;
  }
  
  get contentData(): Record<string, any> {
    return {...this.props.contentData};
  }
  
  get moderationNotes(): string | undefined {
    return this.props.moderationNotes;
  }
  
  get moderatedById(): UniqueEntityID | undefined {
    return this.props.moderatedById;
  }
  
  get moderatedAt(): Date | undefined {
    return this.props.moderatedAt;
  }
  
  get aiSuggestion(): ModerationStatusValue | undefined {
    return this.props.aiSuggestion;
  }
  
  get aiConfidence(): number | undefined {
    return this.props.aiConfidence;
  }
  
  get createdAt(): Date {
    return this.props.createdAt;
  }
  
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  
  get isComplete(): boolean {
    return this.props.status.isCompleted();
  }
  
  get requiresHumanReview(): boolean {
    return this.props.status.requiresHumanReview();
  }

  /**
   * Creates a new moderation task
   */
  public static create(props: Omit<ModerationTaskProps, 'createdAt' | 'updatedAt' | 'status'>, id?: UniqueEntityID): Result<ModerationTask, Error> {
    if (!props.contentId) {
      return failure(new Error('Content ID is required'));
    }
    
    if (!props.contentType || !Object.values(ContentType).includes(props.contentType)) {
      return failure(new Error('Valid content type is required'));
    }
    
    if (!props.contentData || Object.keys(props.contentData).length === 0) {
      return failure(new Error('Content data is required'));
    }
    
    // Default to PENDING status if not provided
    const status = ModerationStatus.PENDING();
    
    const now = new Date();
    const moderationTask = new ModerationTask({
      ...props,
      status,
      createdAt: now,
      updatedAt: now
    }, id);
    
    return success(moderationTask);
  }
  
  /**
   * Approves the content
   */
  public approve(moderatorId: UniqueEntityID, notes?: string): Result<void, Error> {
    if (this.isComplete) {
      return failure(new Error('This moderation task is already completed'));
    }
    
    this.props.status = ModerationStatus.APPROVED();
    this.props.moderatedById = moderatorId;
    this.props.moderatedAt = new Date();
    this.props.moderationNotes = notes;
    this.props.updatedAt = new Date();
    
    // Add domain event
    this.addDomainEvent(new ModerationTaskCompletedEvent(this));
    
    return success(undefined);
  }
  
  /**
   * Rejects the content
   */
  public reject(moderatorId: UniqueEntityID, notes?: string): Result<void, Error> {
    if (this.isComplete) {
      return failure(new Error('This moderation task is already completed'));
    }
    
    if (!notes) {
      return failure(new Error('Rejection notes are required for accountability'));
    }
    
    this.props.status = ModerationStatus.REJECTED();
    this.props.moderatedById = moderatorId;
    this.props.moderatedAt = new Date();
    this.props.moderationNotes = notes;
    this.props.updatedAt = new Date();
    
    // Add domain event
    this.addDomainEvent(new ModerationTaskCompletedEvent(this));
    
    return success(undefined);
  }
  
  /**
   * Flags the content for additional review
   */
  public flag(moderatorId: UniqueEntityID, notes: string): Result<void, Error> {
    if (this.isComplete) {
      return failure(new Error('This moderation task is already completed'));
    }
    
    this.props.status = ModerationStatus.FLAGGED();
    this.props.moderatedById = moderatorId;
    this.props.moderationNotes = notes;
    this.props.updatedAt = new Date();
    
    return success(undefined);
  }
  
  /**
   * Set AI suggestion for automatic moderation
   */
  public setAiSuggestion(suggestion: ModerationStatusValue, confidence: number): Result<void, Error> {
    if (confidence < 0 || confidence > 1) {
      return failure(new Error('Confidence score must be between 0 and 1'));
    }
    
    this.props.aiSuggestion = suggestion;
    this.props.aiConfidence = confidence;
    this.props.updatedAt = new Date();
    
    // Auto-approve if high confidence and suggested approval
    const autoApprovalThreshold = 0.95;
    if (
      confidence >= autoApprovalThreshold && 
      suggestion === ModerationStatusValue.APPROVED &&
      this.props.status.equalsValue(ModerationStatusValue.PENDING)
    ) {
      this.props.status = ModerationStatus.AUTO_APPROVED();
      this.props.moderatedAt = new Date();
      
      // Add domain event
      this.addDomainEvent(new ModerationTaskCompletedEvent(this));
    }
    
    return success(undefined);
  }
}
