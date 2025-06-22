# Modular Software Framework Help

## Overview

The Modular Software Framework (MSF) is a comprehensive architecture designed to create reusable, independent software modules that can be seamlessly integrated into various applications. This framework enables developers to rapidly build applications by assembling pre-built, tested, and documented modules rather than developing every component from scratch.

## Quick Start Guide

### Installation

1. **Backend Setup**:
   ```bash
   # Activate the virtual environment
   source /Users/alokk/EmployDEX/Application/venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start the server
   cd backend
   export FLASK_APP=wsgi.py
   export FLASK_ENV=development
   flask run --host=0.0.0.0 --port=5000
   ```

2. **Frontend Setup**:
   ```bash
   # Install dependencies
   cd frontend
   npm install
   
   # Start development server
   npm start
   
   # View component library (optional)
   npm run storybook
   ```

### Default Access

- **Admin User**: admin
- **Password**: admin
- **Backend API**: http://localhost:5000
- **Frontend UI**: http://localhost:3000
- **Storybook**: http://localhost:6006

## Database Info

The database structure for the Modular Software Framework follows a relational model with clearly defined tables for master data and transactions. The system uses SQLite for development environments and PostgreSQL for production deployments.

### Naming Conventions

- Primary keys follow the format `tablename_id`
- Master data tables use the suffix `_master`
- Transaction tables use the suffix `_tx`
- Foreign key relationships are maintained between related tables

### Database Entity Relationship Diagram

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
       ▲                   │ user_role_id (PK)│         ├──────────────────────┤
       │                   │ user_id (FK)     │         │ role_permission_id(PK)│
       │                   │ role_id (FK)     │         │ role_id (FK)         │
       │                   │ assigned_at      │         │ permission_id (FK)   │
       │                   └──────────────────┘         │ assigned_at          │
       │                                               └──────────────────────┘
┌──────┴───────────┐
│ sessions_tx      │         ┌──────────────────┐         ┌──────────────────────┐
├──────────────────┤         │ modules_master   │◄────┐   │ events_master        │
│ session_id (PK)  │         ├──────────────────┤     │   ├──────────────────────┤
│ user_id (FK)     │         │ module_id (PK)   │     │   │ event_id (PK)        │
│ token            │         │ module_name      │     │   │ event_name           │
│ expires_at       │         │ version          │     │   │ description          │
│ created_at       │         │ description      │     │   │ module_id (FK)       │
│ ip_address       │         │ is_active        │     │   │ created_at           │
│ user_agent       │         │ installed_at     │     │   │ updated_at           │
└──────────────────┘         │ updated_at       │     │   └──────────────────────┘
                             └──────────────────┘     │             ▲
                                    ▲                 │             │
                                    │                 │    ┌────────┴─────────────┐
                             ┌──────┴───────────┐     │    │ event_subscriptions_tx│
                             │ module_dependencies_tx│     ├──────────────────────┤
                             ├──────────────────┤     │    │ subscription_id (PK) │
                             │ dependency_id (PK)│    │    │ event_id (FK)        │
                             │ module_id (FK)   │     │    │ module_id (FK)       │
                             │ required_module_id (FK)├────┘    │ callback_url        │
                             │ min_version      │          │ is_active           │
                             │ max_version      │          │ created_at          │
                             └──────────────────┘          └──────────────────────┘

┌────────────────────┐      ┌─────────────────────┐      ┌────────────────────┐
│ audit_logs_tx      │      │ file_storage_tx     │      │ notifications_tx   │
├────────────────────┤      ├─────────────────────┤      ├────────────────────┤
│ audit_id (PK)      │      │ file_id (PK)        │      │ notification_id(PK)│
│ user_id (FK)       │      │ module_id (FK)      │      │ user_id (FK)       │
│ module_id (FK)     │      │ user_id (FK)        │      │ title              │
│ action             │      │ filename            │      │ message            │
│ entity_type        │      │ file_path           │      │ notification_type  │
│ entity_id          │      │ file_type           │      │ is_read            │
│ old_values         │      │ file_size           │      │ created_at         │
│ new_values         │      │ created_at          │      │ read_at            │
│ timestamp          │      │ updated_at          │      └────────────────────┘
│ ip_address         │      │ is_public           │
└────────────────────┘      └─────────────────────┘

┌────────────────────────┐      ┌────────────────────┐      ┌───────────────────────┐
│ payment_methods_master │      │ payments_tx        │      │ user_consumption_tx   │
├────────────────────────┤      ├────────────────────┤      ├───────────────────────┤
│ payment_method_id (PK) │◄─────┤ payment_id (PK)    │      │ consumption_id (PK)   │
│ user_id (FK)          │      │ user_id (FK)       │      │ user_id (FK)          │
│ provider              │      │ payment_method_id(FK)│     │ module_id (FK)        │
│ token_identifier      │      │ amount             │      │ resource_type         │
│ is_default            │      │ currency           │      │ quantity              │
│ created_at            │      │ status             │      │ unit                  │
│ updated_at            │      │ reference_id       │      │ timestamp             │
└────────────────────────┘      │ description        │      └───────────────────────┘
                               │ created_at         │
                               │ updated_at         │
                               └────────────────────┘
                               
┌─────────────────────┐
│ monitoring_metrics_tx│
├─────────────────────┤
│ metric_id (PK)      │
│ module_id (FK)      │
│ metric_name         │
│ metric_value        │
│ timestamp           │
└─────────────────────┘
```

### Table Descriptions

#### Core User Management

1. **users_master**
   - Primary table for user accounts
   - Stores authentication information and basic profile data
   - Supports user account status tracking

2. **roles_master**
   - Defines the available roles in the system
   - Used for role-based access control

3. **user_roles_tx**
   - Junction table connecting users to their assigned roles
   - Supports many-to-many relationship between users and roles

4. **permissions_master**
   - Defines granular permissions for system actions
   - Organized by resource type

5. **role_permissions_tx**
   - Maps permissions to roles
   - Enables role-based access control

6. **sessions_tx**
   - Tracks active user sessions
   - Stores authentication tokens and session metadata

#### Module Management

7. **modules_master**
   - Registry of all available modules in the system
   - Tracks module versions and activation status

8. **module_dependencies_tx**
   - Maps dependencies between modules
   - Specifies version compatibility requirements

9. **events_master**
   - Registry of events that modules can publish or subscribe to
   - Enables event-driven communication between modules

10. **event_subscriptions_tx**
    - Maps which modules subscribe to which events
    - Stores callback information for event handling

#### Monitoring and Auditing

11. **audit_logs_tx**
    - Records all significant system actions
    - Tracks changes to data for compliance and debugging

12. **monitoring_metrics_tx**
    - Stores performance and operational metrics
    - Used for health monitoring and alerts

#### File Management

13. **file_storage_tx**
    - Tracks uploaded files and their metadata
    - Associates files with modules and users

#### Notifications

14. **notifications_tx**
    - Stores user notifications
    - Tracks notification delivery and read status

#### Payments

15. **payment_methods_master**
    - Stores user payment methods securely
    - Handles multiple payment providers

16. **payments_tx**
    - Records payment transactions
    - Tracks payment status and history

#### Resource Consumption

17. **user_consumption_tx**
    - Tracks resource usage by users
    - Used for billing and resource allocation monitoring

### Default Data

The system comes pre-configured with:
- Default admin user (username: admin, password: admin)
- Basic roles (admin, user, module_developer)
- Core permissions for user and module management

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Modular Software Framework                          │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────┼─────────────────────────────────────────┐
│  ┌─────────────┐   ┌──────────┴───────────┐   ┌─────────────────────┐   │
│  │             │   │                      │   │                     │   │
│  │  Frontend   │◄──┤    API Gateway      │◄──┤  Backend Modules    │   │
│  │  (React)    │   │                      │   │  (Flask)           │   │
│  │             │   │                      │   │                     │   │
│  └─────┬───────┘   └──────────┬───────────┘   └─────────┬───────────┘   │
│        │                      │                         │               │
│  ┌─────┴───────┐   ┌──────────┴───────────┐   ┌─────────┴───────────┐   │
│  │             │   │                      │   │                     │   │
│  │    UI       │   │     Event Bus        │◄──┤  Module Registry    │   │
│  │  Components │   │                      │   │                     │   │
│  │             │   │                      │   │                     │   │
│  └─────────────┘   └──────────┬───────────┘   └─────────────────────┘   │
│                               │                                         │
│                     ┌─────────┴───────────┐                             │
│                     │                     │                             │
│                     │      Database       │                             │
│                     │                     │                             │
│                     └─────────────────────┘                             │
└─────────────────────────────────────────────────────────────────────────┘
```

## Module Flow Diagram

```
┌──────────────┐     ┌────────────────┐     ┌─────────────────┐
│              │     │                │     │                 │
│  Module A    │────►│  Event Bus     │────►│  Module B       │
│              │     │                │     │                 │
└──────────────┘     └────────────────┘     └─────────────────┘
       │                                            │
       │                                            │
       ▼                                            ▼
┌──────────────┐                           ┌─────────────────┐
│              │                           │                 │
│  Database    │◄--------------------------│  API Gateway    │
│              │                           │                 │
└──────────────┘                           └─────────────────┘
                                                   ▲
                                                   │
                                                   │
                                            ┌─────────────────┐
                                            │                 │
                                            │  Frontend       │
                                            │                 │
                                            └─────────────────┘
```

## Sequence Diagram for Module Communication

```
┌──────────┐          ┌──────────┐          ┌──────────┐          ┌──────────┐
│ Module A │          │Event Bus │          │ Module B │         ## Architecture Diagrams

### System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                  Client Layer                                      │
│                                                                                    │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐ │
│  │  Browser   │   │  Mobile    │   │  Desktop   │   │  API       │   │  Third-    │ │
│  │  Client    │   │  App       │   │  App       │   │  Client    │   │  Party     │ │
│  └────────────┘   └────────────┘   └────────────┘   └────────────┘   └────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                API Gateway Layer                                   │
│                                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐ │
│  │  Authentication│   │  Request       │   │  Rate          │   │  API           │ │
│  │  & Authorization│   │  Routing      │   │  Limiting      │   │  Documentation │ │
│  └────────────────┘   └────────────────┘   └────────────────┘   └────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                Module Layer                                       │
│                                                                                    │
│  ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐ │
│  │  User      │   │  Role      │   │  File      │   │  Payment   │   │  Custom    │ │
│  │  Module    │   │  Module    │   │  Module    │   │  Module    │   │  Modules   │ │
│  └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘   └─────┬──────┘ │
│        │                │                │                │                │       │
│        └────────────────┴────────────────┼────────────────┴────────────────┘       │
│                                          │                                         │
└─────────────────────────────────────────┬┴─────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                              Event Communication Layer                             │
│                                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐ │
│  │  Event         │   │  Event         │   │  Event         │   │  Event         │ │
│  │  Publishers    │   │  Subscribers   │   │  Storage       │   │  Monitor       │ │
│  └────────────────┘   └────────────────┘   └────────────────┘   └────────────────┘ │
│                                                                                    │
│                                  Event Bus                                         │
└────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                                 Data Layer                                        │
│                                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐ │
│  │  Database      │   │  Cache         │   │  File          │   │  External      │ │
│  │  Connector     │   │  Manager       │   │  Storage       │   │  APIs          │ │
│  └────────────────┘   └────────────────┘   └────────────────┘   └────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                               Persistence Layer                                   │
│                                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐   ┌────────────────┐ │
│  │  SQLite        │   │  PostgreSQL    │   │  Object        │   │  Cloud         │ │
│  │  (Development) │   │  (Production)  │   │  Storage       │   │  Storage       │ │
│  └────────────────┘   └────────────────┘   └────────────────┘   └────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### Module Communication Flow

```
┌────────────┐                                ┌────────────┐
│            │                                │            │
│  Module A  │                                │  Module B  │
│            │                                │            │
└─────┬──────┘                                └──────┬─────┘
      │                                              │
      │  1. Create Event                             │
      │  (e.g., user.created)                       │
      │                                              │
      ▼                                              │
┌────────────────────────────────────────────────────┴─────┐
│                                                          │
│                      Event Bus                           │
│                                                          │
└─┬────────────────────────────────────────────────────────┘
  │                                              ▲
  │  2. Store Event                             │
  │                                             │
  ▼                                             │
┌────────────┐       3. Notify Subscribers      │
│            │────────────────────────────────────
│  Event     │                                 │
│  Storage   │                                 │
│            │                                 │
└────────────┘                                 │
                                               │
                                               │
┌────────────┐      4. Process Event           │
│            │◄────────────────────────────────┘
│  Module C  │
│            │
└─────┬──────┘
      │
      │  5. Create Response Event
      │  (e.g., notification.sent)
      │
      ▼
┌────────────┐
│            │
│  Event Bus │
│            │
└────────────┘
```

### Frontend Component Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│                     React Application                              │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐     │
│  │                │   │                │   │                │     │
│  │   Pages        │   │  Layouts       │   │  Containers    │     │
│  │                │   │                │   │                │     │
│  └───────┬────────┘   └───────┬────────┘   └───────┬────────┘     │
│          │                    │                    │              │
│          └────────────────────┼────────────────────┘              │
│                               │                                   │
│                               ▼                                   │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │                                                            │   │
│  │                    Component Library                       │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │   │
│  │  │          │  │          │  │          │  │          │   │   │
│  │  │  Button  │  │ DataTable│  │   Form   │  │  Other   │   │   │
│  │  │          │  │          │  │          │  │Components│   │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │   │
│  │                                                            │   │
│  └────────────────────────────────────────────────────────────┘   │
│                               ▲                                   │
│                               │                                   │
│  ┌────────────────┐   ┌──────┴───────┐   ┌────────────────┐      │
│  │                │   │              │   │                │      │
│  │  API Services  │   │  Theme      │   │  Utilities     │      │
│  │                │   │              │   │                │      │
│  └────────────────┘   └──────────────┘   └────────────────┘      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

## Getting Started

To start working with the Modular Software Framework, follow these steps:

1. Clone the repository
2. Install dependencies
3. Initialize the database
4. Start the development server

## Additional Resources

For more information about specific modules, refer to the module documentation in the respective module directories.
