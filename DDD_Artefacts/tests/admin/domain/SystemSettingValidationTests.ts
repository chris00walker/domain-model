import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { SystemSetting } from '../../../src/admin/domain/aggregates/SystemSetting';
import { SystemSettingService } from '../../../src/admin/domain/services/SystemSettingService';
import { SystemSettingKey } from '../../../src/admin/domain/value-objects/SystemSettingKey';
import { SystemSettingValue } from '../../../src/admin/domain/value-objects/SystemSettingValue';
import { ISystemSettingRepository } from '../../../src/admin/domain/repositories/ISystemSettingRepository';
import { IAuditLogService } from '../../../src/admin/domain/services/IAuditLogService';
import { Result } from '../../../src/shared/core/Result';
import { UniqueEntityID } from '../../../src/shared/domain/UniqueEntityID';

describe('System Setting Validation Tests', () => {
  let systemSettingRepo: ISystemSettingRepository;
  let auditLogService: IAuditLogService;
  let systemSettingService: SystemSettingService;
  
  beforeEach(() => {
    // Setup mocks
    systemSettingRepo = {
      findById: jest.fn(),
      findByKey: jest.fn(),
      save: jest.fn().mockResolvedValue(true),
      delete: jest.fn(),
      findAll: jest.fn(),
    } as unknown as ISystemSettingRepository;

    auditLogService = {
      logEvent: jest.fn().mockResolvedValue(true),
    } as unknown as IAuditLogService;

    // Create service with mocked dependencies
    systemSettingService = new SystemSettingService(systemSettingRepo, auditLogService);
  });

  it('should validate boolean settings', async () => {
    // Setup
    const settingKey = SystemSettingKey.create({ name: 'ENABLE_MFA', description: 'Require MFA for all admin users' }).getValue();
    
    // Valid boolean value
    const validValue = SystemSettingValue.create({ 
      type: 'boolean',
      booleanValue: true,
      stringValue: null,
      numberValue: null,
      jsonValue: null
    }).getValue();
    
    // Create valid setting
    const validSettingResult = SystemSetting.create({
      key: settingKey,
      value: validValue,
      isEncrypted: false,
      description: 'Enforce MFA for all admin users',
      lastModified: new Date(),
      modifiedBy: 'system'
    }, new UniqueEntityID());
    
    expect(validSettingResult.isSuccess).toBeTruthy();
    
    // Invalid value type (trying to use string for boolean setting)
    const invalidValue = SystemSettingValue.create({ 
      type: 'boolean',
      booleanValue: null, // Should be boolean
      stringValue: 'true', // Using string instead
      numberValue: null,
      jsonValue: null
    });
    
    expect(invalidValue.isFailure).toBeTruthy();
    expect(invalidValue.error).toContain('Boolean value must be provided');
  });
  
  it('should validate numeric settings with range constraints', async () => {
    // Setup
    const settingKey = SystemSettingKey.create({ 
      name: 'MAX_LOGIN_ATTEMPTS', 
      description: 'Maximum number of failed login attempts before account lockout' 
    }).getValue();
    
    // Valid numeric value within range
    const validValue = SystemSettingValue.create({ 
      type: 'number',
      booleanValue: null,
      stringValue: null,
      numberValue: 5,
      jsonValue: null
    }).getValue();
    
    // Create valid setting
    const validSettingResult = await systemSettingService.createSetting(
      settingKey.name, 
      validValue,
      'Max number of login attempts',
      'system',
      { min: 1, max: 10 } // Range constraints
    );
    
    expect(validSettingResult.isSuccess).toBeTruthy();
    
    // Out of range value (too high)
    const tooHighValue = SystemSettingValue.create({ 
      type: 'number',
      booleanValue: null,
      stringValue: null,
      numberValue: 15, // Over max
      jsonValue: null
    }).getValue();
    
    const tooHighResult = await systemSettingService.createSetting(
      settingKey.name,
      tooHighValue,
      'Max number of login attempts',
      'system',
      { min: 1, max: 10 }
    );
    
    expect(tooHighResult.isFailure).toBeTruthy();
    expect(tooHighResult.error).toContain('exceeds maximum value');
    
    // Out of range value (too low)
    const tooLowValue = SystemSettingValue.create({ 
      type: 'number',
      booleanValue: null,
      stringValue: null,
      numberValue: 0, // Under min
      jsonValue: null
    }).getValue();
    
    const tooLowResult = await systemSettingService.createSetting(
      settingKey.name,
      tooLowValue,
      'Max number of login attempts',
      'system',
      { min: 1, max: 10 }
    );
    
    expect(tooLowResult.isFailure).toBeTruthy();
    expect(tooLowResult.error).toContain('below minimum value');
  });
  
  it('should validate string settings with pattern constraints', async () => {
    // Setup
    const settingKey = SystemSettingKey.create({ 
      name: 'PASSWORD_POLICY', 
      description: 'Password policy regex pattern' 
    }).getValue();
    
    // Valid regex pattern
    const validValue = SystemSettingValue.create({ 
      type: 'string',
      booleanValue: null,
      stringValue: '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$', // Valid regex
      numberValue: null,
      jsonValue: null
    }).getValue();
    
    // Create valid setting
    const validSettingResult = await systemSettingService.createSetting(
      settingKey.name,
      validValue,
      'Password policy regex',
      'system'
    );
    
    expect(validSettingResult.isSuccess).toBeTruthy();
    
    // Attempt to create with empty string (required field)
    const emptyValue = SystemSettingValue.create({ 
      type: 'string',
      booleanValue: null,
      stringValue: '', // Empty string
      numberValue: null,
      jsonValue: null
    }).getValue();
    
    const emptyResult = await systemSettingService.createSetting(
      settingKey.name,
      emptyValue,
      'Password policy regex',
      'system',
      { required: true }
    );
    
    expect(emptyResult.isFailure).toBeTruthy();
    expect(emptyResult.error).toContain('required field');
  });
  
  it('should generate audit logs when settings are updated', async () => {
    // Setup an existing setting
    const settingKey = SystemSettingKey.create({ 
      name: 'MAINTENANCE_MODE', 
      description: 'Site maintenance mode' 
    }).getValue();
    
    const initialValue = SystemSettingValue.create({ 
      type: 'boolean',
      booleanValue: false,
      stringValue: null,
      numberValue: null,
      jsonValue: null
    }).getValue();
    
    const existingSetting = SystemSetting.create({
      key: settingKey,
      value: initialValue,
      isEncrypted: false,
      description: 'Enable site maintenance mode',
      lastModified: new Date(Date.now() - 86400000), // Yesterday
      modifiedBy: 'system'
    }, new UniqueEntityID()).getValue();
    
    jest.spyOn(systemSettingRepo, 'findByKey').mockResolvedValue(Result.ok(existingSetting));
    
    // New value to update
    const updatedValue = SystemSettingValue.create({ 
      type: 'boolean',
      booleanValue: true,
      stringValue: null,
      numberValue: null,
      jsonValue: null
    }).getValue();
    
    // Update the setting
    const updateResult = await systemSettingService.updateSetting(
      settingKey.name,
      updatedValue,
      'admin-user-123'
    );
    
    // Verify successful update
    expect(updateResult.isSuccess).toBeTruthy();
    
    // Verify audit log was created
    expect(auditLogService.logEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'SystemSetting',
        actionType: 'UPDATED',
        entityId: existingSetting.id.toString(),
        userId: 'admin-user-123',
        details: expect.stringContaining('MAINTENANCE_MODE')
      })
    );
    
    // Verify value was updated
    expect(existingSetting.value.booleanValue).toBe(true);
    expect(existingSetting.modifiedBy).toBe('admin-user-123');
  });
});
