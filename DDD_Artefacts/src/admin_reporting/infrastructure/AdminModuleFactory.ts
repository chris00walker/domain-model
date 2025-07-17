import { MongoClient } from 'mongodb';
import { MongoAdminUserRepository } from './persistence/mongodb/MongoAdminUserRepository';
import { MongoRoleRepository } from './persistence/mongodb/MongoRoleRepository';
import { MongoModerationTaskRepository } from './persistence/mongodb/MongoModerationTaskRepository';
import { MongoSystemSettingRepository } from './persistence/mongodb/MongoSystemSettingRepository';
import { MongoAuditLogRepository } from './persistence/mongodb/MongoAuditLogRepository';
import { MongoAuditLogService } from './services/MongoAuditLogService';

import { AdminUserService } from '../domain/services/AdminUserService';
import { ModerationService } from '../domain/services/ModerationService';
import { SystemSettingService } from '../domain/services/SystemSettingService';

/**
 * Factory for creating and wiring up all Admin bounded context components.
 * This provides a clean way to instantiate all necessary services and repositories
 * with their proper dependencies.
 */
export class AdminModuleFactory {
  private mongoClient: MongoClient;
  private dbName: string;
  
  // Repositories
  private adminUserRepository: MongoAdminUserRepository;
  private roleRepository: MongoRoleRepository;
  private moderationTaskRepository: MongoModerationTaskRepository;
  private systemSettingRepository: MongoSystemSettingRepository;
  private auditLogRepository: MongoAuditLogRepository;
  
  // Services
  private auditLogService: MongoAuditLogService;
  private adminUserService: AdminUserService;
  private moderationService: ModerationService;
  private systemSettingService: SystemSettingService;
  
  constructor(mongoClient: MongoClient, dbName: string) {
    this.mongoClient = mongoClient;
    this.dbName = dbName;
    
    this.initializeRepositories();
    this.initializeServices();
  }
  
  /**
   * Initialize all repositories
   */
  private initializeRepositories(): void {
    this.roleRepository = new MongoRoleRepository(
      this.mongoClient, 
      this.dbName
    );
    
    this.adminUserRepository = new MongoAdminUserRepository(
      this.mongoClient, 
      this.dbName,
      this.roleRepository
    );
    
    this.moderationTaskRepository = new MongoModerationTaskRepository(
      this.mongoClient, 
      this.dbName
    );
    
    this.systemSettingRepository = new MongoSystemSettingRepository(
      this.mongoClient, 
      this.dbName
    );
    
    this.auditLogRepository = new MongoAuditLogRepository(
      this.mongoClient, 
      this.dbName
    );
  }
  
  /**
   * Initialize all services
   */
  private initializeServices(): void {
    this.auditLogService = new MongoAuditLogService(
      this.auditLogRepository
    );
    
    this.adminUserService = new AdminUserService(
      this.adminUserRepository,
      this.roleRepository,
      this.auditLogService
    );
    
    this.moderationService = new ModerationService(
      this.moderationTaskRepository,
      this.auditLogService
    );
    
    this.systemSettingService = new SystemSettingService(
      this.systemSettingRepository,
      this.auditLogService
    );
  }
  
  /**
   * Get the Admin User Service
   */
  getAdminUserService(): AdminUserService {
    return this.adminUserService;
  }
  
  /**
   * Get the Moderation Service
   */
  getModerationService(): ModerationService {
    return this.moderationService;
  }
  
  /**
   * Get the System Setting Service
   */
  getSystemSettingService(): SystemSettingService {
    return this.systemSettingService;
  }
  
  /**
   * Get the Audit Log Service
   */
  getAuditLogService(): MongoAuditLogService {
    return this.auditLogService;
  }
  
  /**
   * Get the Admin User Repository
   */
  getAdminUserRepository(): MongoAdminUserRepository {
    return this.adminUserRepository;
  }
  
  /**
   * Get the Role Repository
   */
  getRoleRepository(): MongoRoleRepository {
    return this.roleRepository;
  }
  
  /**
   * Get the Moderation Task Repository
   */
  getModerationTaskRepository(): MongoModerationTaskRepository {
    return this.moderationTaskRepository;
  }
  
  /**
   * Get the System Setting Repository
   */
  getSystemSettingRepository(): MongoSystemSettingRepository {
    return this.systemSettingRepository;
  }
}
