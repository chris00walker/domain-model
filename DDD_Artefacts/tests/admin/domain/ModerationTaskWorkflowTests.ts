import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ModerationTask, ContentType } from '../../../src/admin/domain/aggregates/ModerationTask';
import { ModerationService } from '../../../src/admin/domain/services/ModerationService';
import { ModerationStatus, ModerationStatusValue } from '../../../src/admin/domain/value-objects/ModerationStatus';
import { IModerationTaskRepository } from '../../../src/admin/domain/repositories/IModerationTaskRepository';
import { IAuditLogService } from '../../../src/admin/domain/services/IAuditLogService';
import { AuditLogEntry } from '../../../src/admin/domain/entities/AuditLogEntry';
import { UniqueEntityID } from '../../../src/shared/domain/UniqueEntityID';
import { Result } from '../../../src/shared/core/Result';

// Mock repository implementation
const createMockModerationTaskRepository = (): jest.Mocked<IModerationTaskRepository> => {
  return {
    findById: jest.fn(),
    findByContentId: jest.fn(),
    save: jest.fn(),
    findTasksRequiringReview: jest.fn(),
    countByStatus: jest.fn(),
    countTasksRequiringReview: jest.fn(),
    findAll: jest.fn(),
    findByStatus: jest.fn(),
    findByContentType: jest.fn()
  } as jest.Mocked<IModerationTaskRepository>;
};

// Mock audit log service implementation
const createMockAuditLogService = (): jest.Mocked<IAuditLogService> => {
  return {
    logAction: jest.fn(),
    getLogsForTarget: jest.fn(),
    getLogsForUser: jest.fn(),
    getLogsByActionType: jest.fn(),
    getLogsByDateRange: jest.fn(),
    queryLogs: jest.fn()
  } as jest.Mocked<IAuditLogService>;
};
describe('ModerationTask Workflow', () => {
  let moderationService: ModerationService;
  let moderationTask: ModerationTask;
  let taskId: UniqueEntityID;
  let contentId: UniqueEntityID;
  let moderationTaskRepo: jest.Mocked<IModerationTaskRepository>;
  let auditLogService: jest.Mocked<IAuditLogService>;
  let adminUserId: string;

  beforeEach(() => {
    // Create mock repository
    moderationTaskRepo = createMockModerationTaskRepository();

    // Create mock audit log service
    auditLogService = createMockAuditLogService();

    // Create mock moderation task
    taskId = new UniqueEntityID();
    contentId = new UniqueEntityID();
    const taskOrError = ModerationTask.create({
      contentType: ContentType.PRODUCT_REVIEW,
      contentId: contentId,
      contentData: {
        reviewText: 'Test review',
        rating: 5
      }
    }, taskId);

    if (taskOrError.isFailure()) {
      throw new Error(taskOrError.getErrorValue().toString());
    }
    moderationTask = taskOrError.getValue();

    // Setup default mock implementations
    moderationTaskRepo.findById.mockImplementation((id: UniqueEntityID) => 
      Promise.resolve(id.equals(taskId) ? moderationTask : null)
    );
    
    moderationTaskRepo.save.mockImplementation((task: ModerationTask) => {
      moderationTask = task;
      return Promise.resolve();
    });

    // Create service with mocked dependencies
    moderationService = new ModerationService(
      moderationTaskRepo, 
      auditLogService
    );
    
    adminUserId = new UniqueEntityID().toString();
  });

  it('should enforce proper workflow state transitions', async () => {
    // 1. Task starts as PENDING
    expect(moderationTask.status.valueOf()).toBe(ModerationStatusValue.PENDING);
    
    // 2. Try to reject without reason (should fail)
    const rejectWithoutReasonResult = await moderationService.moderateTask(
      taskId.toString(),
      ModerationStatusValue.REJECTED,
      adminUserId,
      '' // Empty notes
    );
    
    expect(rejectWithoutReasonResult.isFailure()).toBeTruthy();
    expect(rejectWithoutReasonResult.getErrorValue()).toContain('notes are required');
    
    // 3. Reject with valid reason (should succeed)
    const rejectResult = await moderationService.moderateTask(
      taskId.toString(),
      ModerationStatusValue.REJECTED,
      adminUserId,
      'Content violates guidelines'
    );
    
    expect(rejectResult.isSuccess()).toBeTruthy();
    expect(moderationTask.status.valueOf()).toBe(ModerationStatusValue.REJECTED);
    
    // 4. Verify task is now rejected
    expect(moderationTask.status.valueOf()).toBe(ModerationStatusValue.REJECTED);
    
    // 5. Try to approve rejected content (should fail)
    const approveRejectedResult = await moderationService.moderateTask(
      taskId.toString(),
      ModerationStatusValue.APPROVED,
      adminUserId,
      'Attempt to approve rejected content'
    );
    
    expect(approveRejectedResult.isFailure()).toBeTruthy();
    expect(approveRejectedResult.getErrorValue()).toContain('Invalid state transition');
  });

  it('should validate rejection requires notes', async () => {
    // Setup a task for this specific test
    const newTask = ModerationTask.create({
      contentType: ContentType.PRODUCT_DESCRIPTION,
      contentId: new UniqueEntityID(),
      contentData: { description: 'Test product' }
    }).getValue();
    
    // Save task to mock repo
    moderationTaskRepo.findById.mockResolvedValueOnce(newTask);
    
    // Try to reject without notes
    const rejectNoNotesResult = await moderationService.moderateTask(
      newTask.id,
      ModerationStatusValue.REJECTED,
      adminUserId,
      '' // Empty notes
    );
    
    // Verify operation is rejected
    expect(rejectNoNotesResult.isFailure()).toBeTruthy();
    expect(rejectNoNotesResult.getErrorValue()).toContain('notes are required');
  });

  it('should apply AI moderation and track suggestions', async () => {
    // Setup a task for this test
    const newTask = ModerationTask.create({
      contentType: ContentType.PRODUCT_DESCRIPTION,
      contentId: new UniqueEntityID(),
      contentData: { description: 'Good product description' }
    }).getValue();
    
    // Save task to mock repo
    moderationTaskRepo.findById.mockResolvedValueOnce(newTask);
    
    // Test AI suggestion with high confidence
    // Note: Using setAiSuggestion method on ModerationTask instead of a service method
    const aiSuggestionResult = newTask.setAiSuggestion(
      ModerationStatusValue.APPROVED,
      0.97 // High confidence
    );
    
    // Save the task with AI suggestion
    await moderationTaskRepo.save(newTask);
    
    expect(aiSuggestionResult.isSuccess()).toBeTruthy();
    expect(auditLogService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        actionType: 'CONTENT_AUTO_APPROVED'
      })
    );
  });
  
  it('should verify moderation summary generation works', async () => {
    // Setup counts for different statuses
    const mockCounts: Record<string, number> = {
      [ModerationStatusValue.PENDING]: 5,
      [ModerationStatusValue.APPROVED]: 10,
      [ModerationStatusValue.REJECTED]: 2,
      [ModerationStatusValue.FLAGGED]: 3,
      [ModerationStatusValue.AUTO_APPROVED]: 0
    };
    
    // Mock repository to return counts by status
    jest.spyOn(moderationTaskRepo, 'countByStatus').mockImplementation((status) => {
      return Promise.resolve(mockCounts[status] || 0);
    });
    
    // Mock count of tasks requiring review
    jest.spyOn(moderationTaskRepo, 'countTasksRequiringReview').mockResolvedValue(8);
    
    // Get summary
    const summary = await moderationService.getModerationSummary();
    
    // Assert
    expect(summary).toEqual({
      pendingCount: 5,
      approvedCount: 10,
      rejectedCount: 2,
      flaggedCount: 3,
      requiresReviewCount: 8,
      total: 20
    });
  });
  
  it('should find tasks requiring review', async () => {
    // Create a new instance of service and repo for this test
    const testRepo = createMockModerationTaskRepository();
    const testAuditService = createMockAuditLogService();
    const testService = new ModerationService(testRepo, testAuditService);
    
    // Create test tasks
    const pendingTask1 = ModerationTask.create({
      contentType: ContentType.PRODUCT_REVIEW,
      contentId: new UniqueEntityID(),
      contentData: { reviewText: 'Test review 1' }
    }).getValue();
    
    const pendingTask2 = ModerationTask.create({
      contentType: ContentType.PRODUCT_DESCRIPTION,
      contentId: new UniqueEntityID(),
      contentData: { description: 'Test description' }
    }).getValue();
    
    const approvedTask = ModerationTask.create({
      contentType: ContentType.PRODUCT_REVIEW,
      contentId: new UniqueEntityID(),
      contentData: { reviewText: 'Approved review' }
    }).getValue();
    approvedTask.approve(new UniqueEntityID(), 'Approved');
    
    // Mock repository to return pending tasks
    jest.spyOn(testRepo, 'findTasksRequiringReview')
      .mockResolvedValueOnce([pendingTask1, pendingTask2]);
    
    // Act
    const resultOrError = await testService.getPendingTasks();
    
    // Assert
    expect(resultOrError.isSuccess()).toBeTruthy();
    const tasks = resultOrError.getValue();
    expect(tasks.length).toBe(2);
    // Using type assertion to access the id property inherited from AggregateRoot
    expect((tasks[0] as any).id).toEqual((pendingTask1 as any).id);
    expect(tasks[1].contentType).toBe(ContentType.PRODUCT_DESCRIPTION);
  });

  it('should handle task approval workflow', async () => {
    // Arrange
    const moderatorId = new UniqueEntityID();
    // Test finding a task by ID
    const taskId = new UniqueEntityID('task-123');
    const task = ModerationTask.create({
      contentId: new UniqueEntityID('content-123'),
      contentType: ContentType.PRODUCT_DESCRIPTION,
      contentData: { title: 'Test Product', description: 'This is a test product description' }
    }, taskId).getValue();
    
    jest.spyOn(moderationTaskRepo, 'findById')
      .mockResolvedValueOnce(task);
    
    // Get task by ID
    const foundTask = await moderationTaskRepo.findById(taskId);
    expect(foundTask).not.toBeNull();
    
    // Check task status
    expect(foundTask!.status.valueOf()).toBe(ModerationStatusValue.PENDING);

    // Act
    const notes = 'Looks good';
    const result = await moderationService.moderateTask(
      taskId.toString(),
      ModerationStatusValue.APPROVED,
      adminUserId,
      notes
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(task.status.valueOf()).toEqual(ModerationStatusValue.APPROVED);
    expect(task.moderationNotes).toBe(notes);
    expect(auditLogService.logAction).toHaveBeenCalled();
  });

  it('should handle task rejection workflow', async () => {
    // Arrange
    const moderatorId = new UniqueEntityID();
    const notes = 'Inappropriate content';
    const taskId = new UniqueEntityID();

    // Mock the task to be rejected
    const task = ModerationTask.create({
      contentType: ContentType.PRODUCT_REVIEW,
      contentId: new UniqueEntityID(),
      contentData: { reviewText: 'Bad review with inappropriate content' }
    }, taskId).getValue();

    moderationTaskRepo.findById.mockResolvedValueOnce(task);

    // Act
    const result = await moderationService.moderateTask(
      taskId.toString(),
      ModerationStatusValue.REJECTED,
      adminUserId,
      notes
    );

    // Assert
    expect(result.isSuccess).toBe(true);
    expect(task.status.valueOf()).toEqual(ModerationStatusValue.REJECTED);
    expect(task.moderationNotes).toBe(notes);
    expect(auditLogService.logAction).toHaveBeenCalled();
  });
});

describe('ModerationTask Entity', () => {
  it('should create a moderation task with proper initial state', () => {
    const newTaskId = new UniqueEntityID();
    const newContentId = new UniqueEntityID();
    
    const taskOrError = ModerationTask.create({
      contentType: ContentType.PRODUCT_DESCRIPTION,
      contentId: newContentId,
      contentData: {
        description: 'Test product description',
        price: 19.99
      }
    }, newTaskId);
    
    expect(taskOrError.isSuccess()).toBeTruthy();
    
    const task = taskOrError.getValue();
    expect(new UniqueEntityID(task.id).equals(newTaskId)).toBeTruthy();
    expect(task.contentId.equals(newContentId)).toBeTruthy();
    expect(task.contentType).toBe(ContentType.PRODUCT_DESCRIPTION);
    expect(task.status.valueOf()).toBe(ModerationStatusValue.PENDING);
    expect(task.contentData).toEqual({
      description: 'Test product description',
      price: 19.99
    });
  });  

  it('should fail to create task with invalid content type', () => {
    // Arrange
    const taskId = new UniqueEntityID();
    const contentId = new UniqueEntityID();
    const invalidContentType = 'INVALID_TYPE' as ContentType;

    // Act
    const taskOrError = ModerationTask.create({
      contentType: invalidContentType,
      contentId,
      contentData: {}
    }, taskId);

    // Assert
    expect(taskOrError.isFailure()).toBe(true);
  });
});

describe('ModerationService Integration', () => {
  let service: ModerationService;
  let mockRepo: jest.Mocked<IModerationTaskRepository>;
  let mockAuditLog: jest.Mocked<IAuditLogService>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByContentId: jest.fn(),
      save: jest.fn(),
      findTasksRequiringReview: jest.fn(),
      countByStatus: jest.fn(),
      countTasksRequiringReview: jest.fn(),
      findAll: jest.fn(),
      findByStatus: jest.fn(),
      findByContentType: jest.fn()
    } as jest.Mocked<IModerationTaskRepository>;
    
    mockAuditLog = {
      logAction: jest.fn(),
      getLogsForTarget: jest.fn(),
      getLogsForUser: jest.fn(),
      getLogsByActionType: jest.fn(),
      getLogsByDateRange: jest.fn(),
      queryLogs: jest.fn()
    } as jest.Mocked<IAuditLogService>;

    service = new ModerationService(mockRepo, mockAuditLog);
  });

  it('should handle task not found', async () => {
    // Arrange
    mockRepo.findById.mockResolvedValueOnce(null);

    // Act
    const result = await service.moderateTask(
      'non-existent-id', 
      ModerationStatusValue.APPROVED,
      new UniqueEntityID('moderator-1').toString(),
      'test'
    );

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getErrorValue()).toBe('Moderation task not found');
  });

  it('should handle task already processed', async () => {
    // Arrange
    const task = ModerationTask.create({
      contentType: ContentType.PRODUCT_REVIEW,
      contentId: new UniqueEntityID(),
      contentData: {}
    }).getValue();
    
    // Set status to APPROVED
    task.approve(new UniqueEntityID('moderator-id'), 'Approved');
    
    mockRepo.findById.mockResolvedValueOnce(task);

    // Act
    const result = await service.moderateTask(
      task.id.toString(),
      ModerationStatusValue.APPROVED,
      new UniqueEntityID('moderator-1').toString(),
      'test'
    );

    // Assert
    expect(result.isFailure()).toBe(true);
    expect(result.getErrorValue()).toBe('Task has already been processed');
  });
});

describe('ModerationService', () => {
  it('should verify moderation summary counts by status', async () => {
    // Setup test data
    const localRepo = createMockModerationTaskRepository();
    const localAuditService = createMockAuditLogService();
    const localService = new ModerationService(localRepo, localAuditService);
    
    // Mock the countByStatus method
    jest.spyOn(localRepo, 'countByStatus')
      .mockImplementation((status: ModerationStatusValue) => {
        const counts = {
          [ModerationStatusValue.PENDING.valueOf()]: 10,
          [ModerationStatusValue.APPROVED.valueOf()]: 25,
          [ModerationStatusValue.REJECTED.valueOf()]: 5,
          [ModerationStatusValue.FLAGGED.valueOf()]: 3,
          [ModerationStatusValue.AUTO_APPROVED.valueOf()]: 15
        };
        return Promise.resolve(counts[status.valueOf()] || 0);
      });
    
    jest.spyOn(localRepo, 'countTasksRequiringReview')
      .mockResolvedValue(13); // PENDING + FLAGGED
    
    const summary = await localService.getModerationSummary();
    
    // Verify counts match what we expect
    expect(summary[ModerationStatusValue.PENDING.valueOf()]).toBe(10);
    expect(summary[ModerationStatusValue.APPROVED.valueOf()]).toBe(25);
    expect(summary[ModerationStatusValue.REJECTED.valueOf()]).toBe(5);
    expect(summary[ModerationStatusValue.FLAGGED.valueOf()]).toBe(3);
    expect(summary[ModerationStatusValue.AUTO_APPROVED.valueOf()]).toBe(15);
    expect(summary['REQUIRES_REVIEW']).toBe(13);
  });
});
