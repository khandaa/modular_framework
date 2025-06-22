# Modular Software Framework - Product Documentation

## Introduction

The Modular Software Framework (MSF) is an advanced platform designed to facilitate the creation of scalable, maintainable, and modular software systems. This framework enables developers to build applications as a collection of loosely coupled, independently deployable modules that communicate through a standardized event system.

## Core Architecture

### System Overview

The Modular Software Framework implements a hybrid architecture that combines the benefits of microservices with the simplicity of monolithic development:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Gateway Layer                             │
├─────────────────┬─────────────────┬─────────────────┬─────────────────┤
│  Module 1 API   │   Module 2 API  │   Module 3 API  │   Module N API  │
└────────┬────────┴────────┬────────┴────────┬────────┴────────┬────────┘
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Event Bus Layer                               │
├─────────────────────────────────────────────────────────────────────────┤
│  Publishers  │  Subscribers  │  Event Storage  │  Event Monitoring     │
└─────────────────────────────────────────────────────────────────────────┘
         ▲                 ▲                 ▲                 ▲
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌────────┴────────┬────────┴────────┬────────┴────────┬────────┴────────┐
│    Module 1     │     Module 2    │    Module 3     │     Module N    │
│  Business Logic │  Business Logic │  Business Logic │  Business Logic │
└────────┬────────┴────────┬────────┴────────┬────────┴────────┬────────┘
         │                 │                 │                 │
         ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           Database Layer                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Module Registry**
   - Central registry for all system modules
   - Provides dynamic discovery and configuration
   - Enables version control and dependency management

2. **Event Communication System**
   - Event bus for asynchronous communication
   - Publisher-subscriber pattern implementation
   - Event persistence and replay capabilities
   - Real-time event monitoring and filtering

3. **API Gateway**
   - Central entry point for all API requests
   - Request routing to appropriate modules
   - Request/response transformation
   - Rate limiting and security enforcement

4. **Frontend Component Library**
   - Reusable React components with Material UI
   - Storybook documentation for all components
   - Theming system for consistent UI/UX

## Data Flow Diagrams

### Event Publishing Flow

```
┌────────────┐         ┌────────────┐         ┌────────────┐
│  Module A  │         │  Event Bus │         │  Event     │
│  (Source)  │         │            │         │  Storage   │
└─────┬──────┘         └──────┬─────┘         └──────┬─────┘
      │                       │                      │
      │  1. Create Event      │                      │
      │───────────────────────►                      │
      │                       │                      │
      │                       │  2. Persist Event    │
      │                       │────────────────────► │
      │                       │                      │
      │                       │  3. Event Stored     │
      │                       │◄────────────────────┐│
      │                       │                      │
      │  4. Event Published   │                      │
      │◄──────────────────────│                      │
      │                       │                      │
┌─────┴──────┐         ┌──────┴─────┐         ┌──────┴─────┐
│  Module B  │         │  Module C  │         │  Module D  │
│ (Subscriber)│         │(Subscriber)│         │(Subscriber)│
└─────┬──────┘         └──────┬─────┘         └──────┬─────┘
      │                       │                      │
      │  5. Notify Subscribers│                      │
      │◄──────────────────────┼──────────────────────┼──────┐
      │                       │                      │      │
      │                       │  5. Notify Subscribers      │
      │                       │◄─────────────────────┼──────┘
      │                       │                      │
      │                       │                      │  5. Notify Subscribers
      │                       │                      │◄─────┘
      │                       │                      │
      │  6. Process Event     │                      │
      │───────────▼           │                      │
      │                       │  6. Process Event    │
      │                       │───────────▼          │
      │                       │                      │  6. Process Event
      │                       │                      │───────────▼
```

### API Request Flow

```
┌────────────┐         ┌────────────┐         ┌────────────┐         ┌────────────┐
│  Client    │         │    API     │         │   Module   │         │  Database  │
│            │         │  Gateway   │         │            │         │            │
└─────┬──────┘         └──────┬─────┘         └──────┬─────┘         └──────┬─────┘
      │                       │                      │                      │
      │  1. HTTP Request      │                      │                      │
      │───────────────────────►                      │                      │
      │                       │                      │                      │
      │                       │  2. Route Request    │                      │
      │                       │────────────────────► │                      │
      │                       │                      │                      │
      │                       │                      │  3. Database Query   │
      │                       │                      │────────────────────► │
      │                       │                      │                      │
      │                       │                      │  4. Query Results    │
      │                       │                      │◄────────────────────┐│
      │                       │                      │                      │
      │                       │  5. Module Response  │                      │
      │                       │◄────────────────────┐│                      │
      │                       │                      │                      │
      │  6. HTTP Response     │                      │                      │
      │◄──────────────────────│                      │                      │
      │                       │                      │                      │
      │                       │  7. Publish Event    │                      │
      │                       │◄────────────────────┐│                      │
      │                       │                      │                      │
```

## Module Development Guide

### Creating a New Module

1. **Module Structure**
   ```
   my_module/
   ├── __init__.py
   ├── api/
   │   └── routes.py      # API endpoints for the module
   ├── models/
   │   └── data_models.py # Database models specific to this module
   ├── services/
   │   └── service.py     # Business logic services
   └── events/
       ├── publishers.py  # Event publishers
       └── subscribers.py # Event subscribers
   ```

2. **Module Registration**
   - Register your module with the Module Registry
   - Define events produced and consumed by the module
   - Specify module dependencies and version

3. **Event Integration**
   - Define event types and schemas
   - Implement event publishers
   - Create event subscribers
   - Test event flow

### Frontend Integration

1. Create module-specific UI components in `frontend/src/components/`
2. Utilize the component library for consistent UI
3. Connect to backend APIs through the API Gateway
4. Subscribe to events for real-time updates

## Database Schema

The database schema provides a unified data structure across all modules while maintaining clear ownership boundaries:

```
┌────────────────┐         ┌──────────────────┐         ┌──────────────────────┐
│ users_master   │         │ roles_master     │         │ permissions_master   │
├────────────────┤         ├──────────────────┤         ├──────────────────────┤
│ user_id (PK)   │◄───┐    │ role_id (PK)     │◄───┐    │ permission_id (PK)   │
│ username       │    │    │ role_name        │    │    │ permission_name      │
│ email          │    │    │ description      │    │    │ description          │
│ password_hash  │    │    │ created_at       │    │    │ resource             │
│ first_name     │    │    │ updated_at       │    │    │ created_at           │
│ last_name      │    │    └──────────────────┘    │    │ updated_at           │
│ is_active      │    │                            │    └──────────────────────┘
│ created_at     │    │                            │              ▲
│ updated_at     │    │    ┌──────────────────┐    │              │
│ last_login     │    └────┤ user_roles_tx    │    │    ┌─────────┴────────────┐
└────────────────┘         ├──────────────────┤    └────┤ role_permissions_tx  │
                          │ user_role_id (PK)│         ├──────────────────────┤
                          │ user_id (FK)     │         │ role_permission_id(PK)│
                          │ role_id (FK)     │         │ role_id (FK)         │
                          │ assigned_at      │         │ permission_id (FK)   │
                          └──────────────────┘         │ assigned_at          │
                                                      └──────────────────────┘

┌──────────────────┐         ┌──────────────────────┐
│ modules_master   │◄────┐   │ events_master        │
├──────────────────┤     │   ├──────────────────────┤
│ module_id (PK)   │     │   │ event_id (PK)        │
│ module_name      │     │   │ event_name           │
│ version          │     │   │ description          │
│ description      │     │   │ module_id (FK)       │
│ is_active        │     │   │ created_at           │
│ installed_at     │     │   │ updated_at           │
└──────────────────┘     │   └──────────────────────┘
                         │
┌─────────────────────┐  │   ┌──────────────────────┐
│ event_subscriptions │  │   │ event_log_tx         │
├─────────────────────┤  │   ├──────────────────────┤
│ subscription_id (PK)│  │   │ event_log_id (PK)    │
│ module_id (FK)      │──┘   │ event_id (FK)        │
│ event_id (FK)       │      │ payload              │
│ is_active           │      │ timestamp            │
│ created_at          │      │ source_module_id (FK)│
└─────────────────────┘      └──────────────────────┘
```

## Component Library Reference

### Button Component

A versatile button component with multiple variants, sizes, and states.

**Props:**
- `variant`: 'contained' | 'outlined' | 'text' (default: 'contained')
- `color`: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' (default: 'primary')
- `size`: 'small' | 'medium' | 'large' (default: 'medium')
- `startIcon`: React node for icon at start of button
- `endIcon`: React node for icon at end of button
- `fullWidth`: Boolean to make button full width
- `disabled`: Boolean to disable button
- `onClick`: Function to handle click events

### DataTable Component

Advanced table component with sorting, filtering, and pagination.

**Props:**
- `data`: Array of objects to display
- `columns`: Column configuration array
- `loading`: Boolean to show loading state
- `error`: Error message to display
- `pagination`: Object with pagination settings
- `onRowClick`: Function to handle row click
- `onSort`: Function to handle sorting
- `onFilter`: Function to handle filtering
- `density`: 'compact' | 'standard' | 'comfortable'
- `refreshData`: Function to refresh data

### Form Component

Powerful form builder with validation and diverse input types.

**Props:**
- `fields`: Array of field configurations
- `onSubmit`: Function to handle form submission
- `initialValues`: Initial form values
- `validationSchema`: Yup validation schema
- `loading`: Boolean to show loading state
- `submitButtonText`: Text for submit button
- `cancelButtonText`: Text for cancel button
- `onCancel`: Function to handle cancellation

## API Reference

### Core API Endpoints

#### Module Registry

- `GET /api/modules` - List all registered modules
- `POST /api/modules` - Register a new module
- `GET /api/modules/{module_id}` - Get module details
- `PUT /api/modules/{module_id}` - Update module details
- `DELETE /api/modules/{module_id}` - Remove a module

#### Event Bus

- `POST /api/events` - Publish a new event
- `GET /api/events` - List events with filtering
- `GET /api/events/{event_id}` - Get event details
- `POST /api/subscriptions` - Create an event subscription
- `GET /api/subscriptions` - List event subscriptions

## Security Considerations

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control
   - API key management for service-to-service communication

2. **Data Protection**
   - Input validation on all API endpoints
   - SQL injection protection
   - Cross-site scripting (XSS) protection
   - CSRF protection

3. **Event Security**
   - Event signature verification
   - Payload validation
   - Subscription authorization

## Deployment Options

### Development Environment
- SQLite database
- Local Flask development server
- React development server
- In-memory event bus

### Production Environment
- PostgreSQL database
- Gunicorn/Nginx for Flask
- Containerized deployment with Docker
- Redis-backed persistent event bus
- Load balancing and high availability

## Best Practices

1. **Module Development**
   - Keep modules focused on a single responsibility
   - Clearly define module boundaries
   - Document all events published and consumed
   - Include comprehensive tests

2. **Event Design**
   - Use versioned event schemas
   - Include all necessary data in events
   - Design idempotent event handlers
   - Consider event replay scenarios

3. **UI Development**
   - Use the component library for consistency
   - Document components with Storybook
   - Implement responsive designs
   - Add accessibility features

## Troubleshooting

### Common Issues

1. **Module not found in registry**
   - Check module is properly registered
   - Verify module name and version
   - Inspect Module Registry logs

2. **Events not being received by subscribers**
   - Verify subscription is registered and active
   - Check event bus logs for delivery issues
   - Ensure event schema matches expectations

3. **API errors**
   - Check authentication credentials
   - Verify correct API endpoint and parameters
   - Inspect API Gateway logs for detailed errors

## Glossary

- **Module**: Independent functional unit with its own API, business logic, and data models
- **Event**: Message representing a state change or action in the system
- **Publisher**: Module component that creates and sends events
- **Subscriber**: Module component that receives and processes events
- **API Gateway**: Central entry point for all API requests
- **Module Registry**: Central registry of all modules and their capabilities
