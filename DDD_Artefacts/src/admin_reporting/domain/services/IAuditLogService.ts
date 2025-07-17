import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { Result } from '../../../shared/core/Result';
import { AuditLogEntry } from '../entities/AuditLogEntry';

/**
 * Represents the details of an action to be logged
 */
export interface AuditLogActionDetails {
  actionType: string;
  performedBy: UniqueEntityID;
  targetId?: UniqueEntityID;
  details: Record<string, any>;
}

/**
 * IAuditLogService
 * 
 * Service interface for audit logging operations.
 * This service is responsible for recording all administrative actions
 * for security and compliance purposes.
 */
export interface IAuditLogService {
  /**
   * Logs an administrative action
   */
  logAction(details: AuditLogActionDetails): Promise<void>;
  
  /**
   * Retrieves audit logs for a specific target entity
   */
  getLogsForTarget(targetId: UniqueEntityID, limit?: number, offset?: number): Promise<any[]>;
  
  /**
   * Retrieves audit logs performed by a specific admin user
   */
  getLogsForUser(userId: UniqueEntityID, limit?: number, offset?: number): Promise<any[]>;
  
  /**
   * Retrieves audit logs filtered by action type
   */
  getLogsByActionType(actionType: string, limit?: number, offset?: number): Promise<any[]>;
  
  /**
   * Retrieves audit logs within a specified time range
   */
  getLogsByDateRange(startDate: Date, endDate: Date, limit?: number, offset?: number): Promise<any[]>;
  
  /**
   * Query audit logs with multiple filter criteria
   */
  queryLogs(filters: {
    actionType?: string;
    performedBy?: UniqueEntityID;
    targetId?: UniqueEntityID;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Result<{
    entries: AuditLogEntry[];
    totalCount: number;
  }>>;
}
