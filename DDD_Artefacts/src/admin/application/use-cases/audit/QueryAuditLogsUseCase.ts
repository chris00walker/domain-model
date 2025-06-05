import { Result, success, failure } from '../../../../shared/core/Result';
import { IAuditLogService } from '../../../domain/services/IAuditLogService';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';
import { AuditLogEntry } from '../../../domain/entities/AuditLogEntry';
import { Entity } from '../../../../shared/domain/Entity';

interface QueryAuditLogsRequest {
  actionType?: string;
  performedBy?: string;
  targetId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

interface AuditLogEntryDTO {
  id: string;
  actionType: string;
  performedBy: string;
  targetId: string;
  timestamp: Date;
  details: Record<string, any>;
}

type QueryAuditLogsResponse = Result<{
  entries: AuditLogEntryDTO[];
  totalCount: number;
}, Error>;

/**
 * QueryAuditLogsUseCase
 * 
 * Use case for querying audit logs with various filters
 */
export class QueryAuditLogsUseCase {
  
  constructor(
    private readonly auditLogService: IAuditLogService
  ) {}
  
  async execute(request: QueryAuditLogsRequest): Promise<QueryAuditLogsResponse> {
    try {
      const {
        actionType,
        performedBy,
        targetId,
        startDate,
        endDate,
        limit = 50,
        offset = 0
      } = request;
      
      // Convert string IDs to UniqueEntityID if provided
      const performedById = performedBy ? new UniqueEntityID(performedBy) : undefined;
      const targetEntityId = targetId ? new UniqueEntityID(targetId) : undefined;
      
      // Query audit logs via domain service
      const logsResult = await this.auditLogService.queryLogs({
        actionType,
        performedBy: performedById,
        targetId: targetEntityId,
        startDate,
        endDate,
        limit,
        offset
      });
      
      if (logsResult.isFailure) {
        return failure(new Error(logsResult.error));
      }
      
      const { entries, totalCount } = logsResult.getValue();
      
      // Map to DTOs
      const entryDTOs = entries.map((entry: AuditLogEntry) => ({
        // Access id through entity base class
        id: (entry as unknown as { id: UniqueEntityID }).id.toString(),
        actionType: entry.actionType,
        performedBy: entry.performedBy.toString(),
        targetId: entry.targetId ? entry.targetId.toString() : '',
        timestamp: entry.timestamp,
        details: entry.details
      }));
      
      return success({
        entries: entryDTOs,
        totalCount
      });
      
    } catch (error: any) {
      return failure(new Error(`Failed to query audit logs: ${error.message || error}`));
    }
  }
}
