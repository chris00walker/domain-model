/**
 * Admin Bounded Context - Main Entry Point
 * 
 * Handles administrative operations including user management, content moderation,
 * system configuration, and audit logging.
 */

// Domain layer exports
export * from './domain/index';

// Application layer exports
export * from './application/index';

// Infrastructure layer exports
export * from './infrastructure/index';

// Module factory for dependency injection
export * from './infrastructure/AdminModuleFactory';
