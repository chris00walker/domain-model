import { Result, success, failure } from '../../../../shared/core/Result';
import { ModerationService } from '../../../domain/services/ModerationService';

interface GetPendingModerationTasksRequest {
  limit?: number;
  offset?: number;
}

interface ModerationTaskDTO {
  id: string;
  contentId: string;
  contentType: string;
  contentData: any;
  status: string;
  createdAt: Date;
  aiSuggestion?: string;
  aiConfidence?: number;
}

type GetPendingModerationTasksResponse = Result<{
  tasks: ModerationTaskDTO[];
  totalCount: number;
}, Error>;

/**
 * GetPendingModerationTasksUseCase
 * 
 * Use case for retrieving moderation tasks that need review
 */
export class GetPendingModerationTasksUseCase {
  
  constructor(
    private readonly moderationService: ModerationService
  ) {}
  
  async execute(request: GetPendingModerationTasksRequest): Promise<GetPendingModerationTasksResponse> {
    try {
      const { limit = 20, offset = 0 } = request;
      
      // Get pending tasks from domain service
      const tasksResult = await this.moderationService.getPendingTasks(limit, offset);
      
      if (tasksResult.isFailure()) {
        return failure(tasksResult.getErrorValue());
      }
      
      const tasks = tasksResult.getValue();
      
      // Get total count for pagination
      const countResult = await this.moderationService.countPendingTasks();
      
      if (countResult.isFailure()) {
        return failure(countResult.getErrorValue());
      }
      
      const totalCount = countResult.getValue();
      
      // Map to DTOs
      const taskDTOs = tasks.map((task: any) => ({
        id: task.id.toString(),
        contentId: task.contentId.toString(),
        contentType: task.contentType,
        contentData: task.contentData,
        status: task.status.value,
        createdAt: task.createdAt,
        aiSuggestion: task.aiSuggestion,
        aiConfidence: task.aiConfidence
      }));
      
      return success({
        tasks: taskDTOs,
        totalCount
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to retrieve pending moderation tasks: ${error.message || error}`));
    }
  }
}
