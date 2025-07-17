import { Result, success, failure } from '../../../../shared/core/Result';
import { ModerationService } from '../../../domain/services/ModerationService';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { UseCase } from '../../../../shared/application/UseCase';
import { ContentType } from '../../../domain/value-objects/ContentType';

interface SubmitContentForModerationRequest {
  contentId: string;
  contentType: string;
  contentData: Record<string, any>;
  submitById: string;
  priority?: number;
  useAiAssistance?: boolean;
}

type SubmitContentForModerationResponse = Result<{
  moderationTaskId: string;
  status: string;
}, Error>;

/**
 * SubmitContentForModerationUseCase
 * 
 * Use case for submitting content for moderation review
 */
export class SubmitContentForModerationUseCase implements UseCase<SubmitContentForModerationRequest, SubmitContentForModerationResponse> {
  
  constructor(
    private readonly moderationService: ModerationService
  ) {}
  
  async execute(request: SubmitContentForModerationRequest): Promise<SubmitContentForModerationResponse> {
    try {
      // Validate content type
      const contentTypeOrError = ContentType.create(request.contentType);
      if (contentTypeOrError.isFailure) {
        return failure(new Error(`Invalid content type: ${request.contentType}`));
      }
      
      const contentType = contentTypeOrError.getValue();
      
      // Submit content for moderation
      const taskResult = await this.moderationService.createModerationTask(
        contentType,
        request.contentId,
        request.contentData
      );
      
      if (taskResult.isFailure) {
        return failure(new Error(taskResult.error));
      }
      
      const moderationTask = taskResult.getValue();
      
      return success({
        moderationTaskId: moderationTask.id.toString(),
        status: moderationTask.status.value
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to submit content for moderation: ${error.message || error}`));
    }
  }
}
