import { IAuditLogService, AuditLogActionDetails } from '../../domain/services/IAuditLogService';
import { MongoAuditLogRepository } from '../persistence/mongodb/MongoAuditLogRepository';
import { AuditLogEntry } from '../../domain/entities/AuditLogEntry';
import { UniqueEntityID } from '../../../../shared/domain/UniqueEntityID';

/**
 * MongoDB implementation of the AuditLogService
 * 
 * This service handles logging and retrieving administrative actions
 * using MongoDB for persistence.
 */
export class MongoAuditLogService implements IAuditLogService {
  constructor(private readonly auditLogRepository: MongoAuditLogRepository) {}
  
  /**
   * Logs an administrative action
   */
  async logAction(details: AuditLogActionDetails): Promise<void> {
    const auditLogEntryOrError = AuditLogEntry.create({
      actionType: details.actionType,
      performedBy: details.performedBy,
      targetId: details.targetId,
      details: details.details || {},
      timestamp: new Date()
    });
    
    if (auditLogEntryOrError.isFailure) {
      console.error('Failed to create audit log entry:', auditLogEntryOrError.error);
      return;
    }
    
    const auditLogEntry = auditLogEntryOrError.getValue();
    await this.auditLogRepository.insert(auditLogEntry);
  }
  
  /**
   * Retrieves audit logs for a specific target entity
   */
  async getLogsForTarget(targetId: UniqueEntityID, limit: number = 100, offset: number = 0): Promise<any[]> {
    const entries = await this.auditLogRepository.findByTargetId(targetId, limit, offset);
    return this.mapToDTO(entries);
  }
  
  /**
   * Retrieves audit logs performed by a specific admin user
   */
  async getLogsForUser(userId: UniqueEntityID, limit: number = 100, offset: number = 0): Promise<any[]> {
    const entries = await this.auditLogRepository.findByUserId(userId, limit, offset);
    return this.mapToDTO(entries);
  }
  
  /**
   * Retrieves audit logs filtered by action type
   */
  async getLogsByActionType(actionType: string, limit: number = 100, offset: number = 0): Promise<any[]> {
    const entries = await this.auditLogRepository.findByActionType(actionType, limit, offset);
    return this.mapToDTO(entries);
  }
  
  /**
   * Retrieves audit logs within a specified time range
   */
  async getLogsByDateRange(startDate: Date, endDate: Date, limit: number = 100, offset: number = 0): Promise<any[]> {
    const entries = await this.auditLogRepository.findByDateRange(startDate, endDate, limit, offset);
    return this.mapToDTO(entries);
  }
  
  /**
   * Maps domain entities to data transfer objects for API responses
   */
  private mapToDTO(entries: AuditLogEntry[]): any[] {
    return entries.map(entry => ({
      id: entry.id.toString(),
      actionType: entry.actionType,
      performedBy: entry.performedBy.toString(),
      targetId: entry.targetId ? entry.targetId.toString() : null,
      details: entry.details,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      timestamp: entry.timestamp.toISOString()
    }));
  }
}
