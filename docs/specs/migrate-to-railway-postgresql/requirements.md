# Requirements Document

## Introduction

This document outlines the requirements for migrating the SIPJOK application database from Supabase to Railway PostgreSQL while maintaining Supabase authentication. The migration aims to create a portable, vendor-independent database layer that can be easily migrated to a VPS in the future.

## Glossary

- **SIPJOK Application**: The Physical Education Information System web application
- **Supabase Client**: The JavaScript client library that provides direct database access via `supabase.from()`
- **Drizzle ORM**: A TypeScript ORM that provides type-safe database queries
- **Railway PostgreSQL**: A managed PostgreSQL database service provided by Railway
- **API Layer**: Express.js REST API endpoints that handle database operations
- **Custom Hooks**: React hooks that manage data fetching and state (e.g., useClasses, useStudents)
- **Database Schema**: The structure of database tables including users, classes, students, grades, etc.
- **Migration Script**: A script that exports data from Supabase and imports it into Railway PostgreSQL

## Requirements

### Requirement 1: Database Infrastructure Setup

**User Story:** As a developer, I want to set up Railway PostgreSQL and configure the application to connect to it, so that the application can use a portable database solution.

#### Acceptance Criteria

1. WHEN the developer provisions Railway PostgreSQL, THE SIPJOK Application SHALL have access to a DATABASE_URL environment variable
2. WHEN the application starts, THE SIPJOK Application SHALL successfully connect to Railway PostgreSQL using Drizzle ORM
3. WHEN database schema is pushed, THE Railway PostgreSQL SHALL contain all required tables matching the Drizzle schema definition
4. WHERE the application runs in development, THE SIPJOK Application SHALL connect to the local or Railway database based on DATABASE_URL configuration

### Requirement 2: Database Schema Migration

**User Story:** As a developer, I want to replicate the existing Supabase database schema in Railway PostgreSQL, so that all application data structures are preserved.

#### Acceptance Criteria

1. WHEN the schema is defined in Drizzle, THE Database Schema SHALL include all tables from the current Supabase database (users, classes, students, grades, teaching_journal, student_attendance, class_schedule, modul_ajar, atp, kktp, exam_questions, teacher_profile, curriculum_documents, calendar_events)
2. WHEN the schema is pushed to Railway, THE Railway PostgreSQL SHALL create all tables with correct column types, constraints, and relationships
3. WHEN a table has a user_id column, THE Database Schema SHALL include a foreign key reference to the users table
4. WHEN a table requires timestamps, THE Database Schema SHALL include created_at and updated_at columns with automatic timestamp generation

### Requirement 3: API Layer Implementation

**User Story:** As a developer, I want to create REST API endpoints that replace Supabase client calls, so that the frontend can interact with the database through a standard API.

#### Acceptance Criteria

1. WHEN the frontend requests data, THE API Layer SHALL provide RESTful endpoints for all CRUD operations (GET, POST, PUT, DELETE)
2. WHEN an API endpoint is called, THE API Layer SHALL use Drizzle ORM to query Railway PostgreSQL
3. WHEN a user makes a request, THE API Layer SHALL validate the user's authentication token from Supabase
4. WHEN an error occurs, THE API Layer SHALL return appropriate HTTP status codes and error messages
5. WHEN a request includes user-specific data, THE API Layer SHALL filter results based on the authenticated user's ID

### Requirement 4: Frontend Refactoring

**User Story:** As a developer, I want to refactor all Supabase client calls in the frontend to use the new API layer, so that the application no longer depends on Supabase for database operations.

#### Acceptance Criteria

1. WHEN a custom hook fetches data, THE Custom Hooks SHALL call API endpoints instead of using `supabase.from()`
2. WHEN the frontend needs user authentication, THE SIPJOK Application SHALL continue using Supabase Auth (no changes to auth flow)
3. WHEN a component performs CRUD operations, THE SIPJOK Application SHALL send HTTP requests to the API Layer
4. WHEN data is fetched, THE Custom Hooks SHALL handle loading states, error states, and success states consistently
5. WHEN the user is not authenticated, THE API Layer SHALL return 401 Unauthorized responses

### Requirement 5: Data Migration

**User Story:** As a developer, I want to migrate all existing data from Supabase to Railway PostgreSQL, so that users can continue using the application without data loss.

#### Acceptance Criteria

1. WHEN the migration script runs, THE Migration Script SHALL export all data from Supabase tables
2. WHEN data is exported, THE Migration Script SHALL preserve all relationships and foreign key references
3. WHEN data is imported to Railway, THE Railway PostgreSQL SHALL contain all records from Supabase
4. WHEN the migration completes, THE Migration Script SHALL provide a summary report of migrated records per table
5. IF a migration error occurs, THEN THE Migration Script SHALL log the error and continue with remaining tables

### Requirement 6: Testing and Validation

**User Story:** As a developer, I want to verify that all application features work correctly with Railway PostgreSQL, so that I can confidently deploy the migrated application.

#### Acceptance Criteria

1. WHEN each API endpoint is implemented, THE SIPJOK Application SHALL pass integration tests for that endpoint
2. WHEN the frontend is refactored, THE SIPJOK Application SHALL maintain all existing functionality
3. WHEN a user performs CRUD operations, THE SIPJOK Application SHALL successfully create, read, update, and delete records in Railway PostgreSQL
4. WHEN the application is tested, THE SIPJOK Application SHALL handle authentication correctly using Supabase Auth
5. WHEN data is queried, THE SIPJOK Application SHALL return results filtered by the authenticated user's ID

### Requirement 7: Deployment and Configuration

**User Story:** As a developer, I want to deploy the migrated application to Railway with proper environment configuration, so that the production application uses Railway PostgreSQL.

#### Acceptance Criteria

1. WHEN the application is deployed to Railway, THE SIPJOK Application SHALL use the Railway-provided DATABASE_URL
2. WHEN environment variables are configured, THE Railway Service SHALL have access to both DATABASE_URL and Supabase Auth credentials
3. WHEN the application starts in production, THE SIPJOK Application SHALL successfully connect to Railway PostgreSQL
4. WHEN users access the production application, THE SIPJOK Application SHALL function identically to the Supabase version
5. WHEN the deployment is complete, THE SIPJOK Application SHALL be accessible at the Railway-provided URL
