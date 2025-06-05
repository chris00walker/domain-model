import { Entity } from '@shared/domain/Entity';
import { UniqueEntityID } from '@shared/domain/UniqueEntityID';
import { Result, success } from '@shared/core/Result';

interface AuditLogEntryProps {
  actionType: string;
  performedBy: UniqueEntityID;
  targetId?: UniqueEntityID;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * AuditLogEntry Entity
 * 
 * Represents a record of an administrative action for security and compliance tracking.
 * Each audit log captures who performed what action on which entity and when.
 */
export class AuditLogEntry extends Entity<AuditLogEntryProps> {
  
  get actionType(): string {
    return this.props.actionType;
  }
  
  get performedBy(): UniqueEntityID {
    return this.props.performedBy;
  }
  
  get targetId(): UniqueEntityID | undefined {
    return this.props.targetId;
  }
  
  get details(): Record<string, any> {
    return {...this.props.details};
  }
  
  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }
  
  get userAgent(): string | undefined {
    return this.props.userAgent;
  }
  
  get timestamp(): Date {
    return this.props.timestamp;
  }

  /**
   * Creates a new audit log entry
   */
  public static create(props: AuditLogEntryProps, id?: UniqueEntityID): Result<AuditLogEntry> {
    const auditLogEntry = new AuditLogEntry({
      ...props,
      timestamp: props.timestamp || new Date()
    }, id);
    
    return success(auditLogEntry);
  }
}
