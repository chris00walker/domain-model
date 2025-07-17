import { MongoClient, ObjectId } from 'mongodb';
import { AuditLogEntry } from '../../../domain/entities/AuditLogEntry';
import { UniqueEntityID } from '../../../../../shared/domain/UniqueEntityID';

/**
 * MongoDB repository for audit log entries
 * 
 * This repository is designed for append-only operations to maintain 
 * immutability of audit logs for compliance and security.
 */
export class MongoAuditLogRepository {
  private collection;
  
  constructor(
    private readonly client: MongoClient,
    private readonly dbName: string
  ) {
    this.collection = client.db(dbName).collection('audit_logs');
    
    // Create indexes for common query patterns
    this.setupIndexes();
  }
  
  private async setupIndexes() {
    await this.collection.createIndexes([
      { key: { 'performedBy': 1 }, name: 'idx_performed_by' },
      { key: { 'targetId': 1 }, name: 'idx_target_id' },
      { key: { 'actionType': 1 }, name: 'idx_action_type' },
      { key: { 'timestamp': -1 }, name: 'idx_timestamp_desc' }
    ]);
  }
  
  /**
   * Maps a domain AuditLogEntry to a MongoDB document
   */
  private toPersistence(entry: AuditLogEntry): any {
    return {
      actionType: entry.actionType,
      performedBy: entry.performedBy.toString(),
      targetId: entry.targetId ? entry.targetId.toString() : undefined,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      timestamp: entry.timestamp
    };
  }
  
  /**
   * Maps a MongoDB document to a domain AuditLogEntry
   */
  private toDomain(record: any): AuditLogEntry {
    const props = {
      actionType: record.actionType,
      performedBy: new UniqueEntityID(record.performedBy),
      targetId: record.targetId ? new UniqueEntityID(record.targetId) : undefined,
      details: record.details || {},
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      timestamp: new Date(record.timestamp)
    };
    
    const id = new UniqueEntityID(record._id.toString());
    return AuditLogEntry.create(props, id).getValue();
  }
  
  /**
   * Inserts a new audit log entry
   * This is append-only, modifications are not supported to maintain integrity
   */
  async insert(entry: AuditLogEntry): Promise<void> {
    const record = this.toPersistence(entry);
    await this.collection.insertOne(record);
  }
  
  /**
   * Finds audit log entries by target entity ID
   */
  async findByTargetId(targetId: UniqueEntityID, limit: number = 100, offset: number = 0): Promise<AuditLogEntry[]> {
    const records = await this.collection
      .find({ targetId: targetId.toString() })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }
  
  /**
   * Finds audit log entries by the user who performed them
   */
  async findByUserId(userId: UniqueEntityID, limit: number = 100, offset: number = 0): Promise<AuditLogEntry[]> {
    const records = await this.collection
      .find({ performedBy: userId.toString() })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }
  
  /**
   * Finds audit log entries by action type
   */
  async findByActionType(actionType: string, limit: number = 100, offset: number = 0): Promise<AuditLogEntry[]> {
    const records = await this.collection
      .find({ actionType })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }
  
  /**
   * Finds audit log entries by date range
   */
  async findByDateRange(startDate: Date, endDate: Date, limit: number = 100, offset: number = 0): Promise<AuditLogEntry[]> {
    const records = await this.collection
      .find({ 
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ timestamp: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
    
    return records.map(record => this.toDomain(record));
  }
  
  /**
   * Count all audit log entries
   */
  async count(): Promise<number> {
    return this.collection.countDocuments();
  }
}
