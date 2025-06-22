# Modular Software Framework

A comprehensive framework for building modular, reusable software components that can be independently deployed and scaled like microservices. This framework enables rapid application development by providing pluggable modules for common functionality.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.2.0-brightgreen.svg)](https://github.com/khandaa/modular_framework/releases)

## Overview

The Modular Software Framework (MSF) has been designed to solve the common challenge of building scalable, maintainable software systems by embracing a modular, event-driven architecture. It provides a set of tools and patterns that enable developers to create independent modules that can be assembled into complex applications.

## Features

- Microservice-like architecture with independently deployable modules
- Event-driven communication between modules
- Flask-based backend APIs
- React-based frontend with Material UI
- SQLite database (development) / PostgreSQL (production)
- Role-based access control
- Docker containerization for each module

## Project Structure

```
├── backend/                  # Backend Flask modules
│   ├── api_gateway/          # API Gateway implementation
│   │   └── api/              # API Gateway routes
│   ├── core/                 # Core framework functionality
│   │   ├── models/          # Base models
│   │   ├── app.py           # Flask application factory
│   │   ├── config.py        # Configuration management
│   │   └── db.py            # Database connectivity
│   ├── event_bus/           # Event-driven communication system
│   │   ├── api/             # Event API endpoints
│   │   ├── schemas/         # Event validation schemas
│   │   ├── event_bus.py     # Event bus implementation
│   │   ├── publisher.py     # Event publishing component
│   │   ├── storage.py       # Event persistence
│   │   └── subscriber.py    # Event subscription component
│   ├── module_registry/     # Module registration and discovery
│   │   └── api/             # Module registry API endpoints
│   ├── tests/               # Backend unit and integration tests
│   └── wsgi.py              # WSGI entry point
├── frontend/                # React frontend modules and components
│   ├── .storybook/          # Storybook configuration
│   └── src/
│       ├── components/      # React components
│       │   ├── common/      # Shared components
│       │   │   ├── Header.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── Sidebar.jsx
│       │   ├── library/     # Component library
│       │   │   ├── Button/  # Button component and stories
│       │   │   ├── DataTable/ # DataTable component and stories
│       │   │   └── Form/    # Form component and stories
│       │   ├── Dashboard.jsx
│       │   ├── EventMonitor.jsx
│       │   └── ModuleRegistry.jsx
│       └── theme/           # Theming and styling
├── database/                # Database schema and migrations
│   └── schema.sql           # SQLite schema definition
├── docs/                    # Documentation
│   └── help.md              # Help documentation with architecture diagrams
└── tasks/                   # Project requirements and specifications
    ├── prd-modular-software-framework.md # Product Requirements Document
    └── tasks-modular-software-framework.md # Task breakdown
```

## Architecture

The Modular Software Framework employs a layered architecture with clean separation of concerns:

### Backend Architecture

1. **Core Layer**: The foundation of the framework providing configuration, database connectivity, and base classes.

2. **Module Registry**: Enables dynamic registration and discovery of modules within the system.

3. **Event Communication System**: Facilitates asynchronous communication between modules using a publish-subscribe pattern.

4. **API Gateway**: Routes incoming requests to appropriate modules and provides unified API documentation.

### Frontend Architecture

1. **Component Library**: Reusable UI components built with React and Material UI, documented with Storybook.

2. **Event Monitor**: Real-time visualization and filtering of system events.

3. **Module-Specific UIs**: Independent frontend components that correspond to backend modules.

### Database Architecture

The system uses SQLite for development and supports PostgreSQL for production deployments with a relational model that maintains clear relationships between modules and their data.

## Initial Modules

1. **Core Framework Module** - Module definition and registration system
2. **User Management Module** - Authentication, user registration, profile management
3. **Role Management Module** - RBAC, permission management
4. **API Gateway Module** - Request routing, API documentation
5. **Database Connector Module** - Connection pooling, migrations
6. **UI Components Module** - Reusable React components
7. **File Storage Module** - File management
8. **Notification Module** - Various notification methods
9. **Audit Trail Module** - Activity logging, compliance
10. **Health & Monitoring Module** - System health metrics
11. **Payment Gateway Module** - Payment processing
12. **User Consumption Module** - Resource usage tracking

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- SQLite 3.30+ (for development)
- Docker (optional, for containerization)

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/khandaa/modular_framework.git
   cd modular_framework
   ```

2. Set up Python virtual environment
   ```bash
   # Use existing virtual environment at /Users/alokk/EmployDEX/Applications/venv or create if not present
   if [ ! -d "/Users/alokk/EmployDEX//Applications/venv" ]; then
     python -m venv /Users/alokk/EmployDEX/Applications/venv
   fi
   source /Users/alokk/EmployDEX/Applications/venv/bin/activate
   pip install -r requirements.txt
   ```

3. Set up frontend dependencies
   ```bash
   # Use node_modules at /Users/alokk/EmployDEX/Applications/node_modules or install locally
   if [ ! -d "/Users/alokk/EmployDEX/Applications/node_modules" ]; then
     mkdir -p /Users/alokk/EmployDEX/Applications/node_modules
   fi
   cd frontend
   npm install
   ```

4. Initialize the database
   ```bash
   cd database
   mkdir -p data
   sqlite3 data/modular_framework.db < schema.sql
   ```

### Running the Application

1. Start the backend
   ```bash
   source /Users/alokk/EmployDEX/Applications/venv/bin/activate
   cd backend
   export FLASK_APP=wsgi.py
   export FLASK_ENV=development
   flask run --host=0.0.0.0 --port=5000
   ```

2. Start the frontend
   ```bash
   cd frontend
   npm start
   ```
   The frontend will be available at http://localhost:3000

3. View component documentation with Storybook
   ```bash
   cd frontend
   npm run storybook
   ```
   Storybook will be available at http://localhost:6006

### Development Workflow

1. **Adding a New Module**
   - Create a new directory in `backend/` for your module
   - Register the module in the Module Registry via API
   - Implement frontend components as needed in `frontend/src/components/`

2. **Using the Event Bus**
   - Import the Publisher from `backend.event_bus.publisher`
   - Create and publish events to communicate between modules
   - Subscribe to events you want your module to handle

3. **Creating UI Components**
   - Add new components to the `frontend/src/components/library/` directory
   - Document components with Storybook stories
   - Reuse existing components where possible

## Default Credentials

- Username: `admin`
- Password: `admin`

## API Documentation

The API Gateway provides a unified interface to all module endpoints. API documentation is available at `http://localhost:5000/api/docs` when the backend is running.

## Testing

- Run backend tests with `pytest`:
  ```bash
  cd backend
  python -m pytest tests/
  ```

- Run frontend tests with Jest:
  ```bash
  cd frontend
  npm test
  ```

## Deployment

### Docker

1. Build the Docker images:
   ```bash
   docker build -t modular-framework-backend ./backend
   docker build -t modular-framework-frontend ./frontend
   ```

2. Run containers:
   ```bash
   docker run -d -p 5000:5000 --name backend modular-framework-backend
   docker run -d -p 3000:3000 --name frontend modular-framework-frontend
   ```

## Documentation

Refer to the [help documentation](./docs/help.md) for:

- **Architecture diagrams** showing the system structure
- **Data flow diagrams** illustrating how information moves through the framework
- **Sequence diagrams** explaining key interactions between components
- **API Reference** with detailed information about endpoints and payloads
- **Database schema** documentation
- **Module development guide** with best practices

## Component Library

The framework includes a comprehensive set of reusable UI components built with React and Material UI:

- **Button**: Versatile button component with multiple variants, sizes, and states
- **DataTable**: Advanced table component with sorting, filtering, and pagination
- **Form**: Powerful form builder with validation and diverse input types

All components are documented with Storybook and can be viewed by running `npm run storybook` in the frontend directory.

## Event Communication System

The event-driven architecture allows modules to communicate without direct dependencies:

- **Publishers** emit events when significant actions occur
- **Subscribers** listen for events and react accordingly
- **Event Bus** routes events between publishers and subscribers
- **Event Storage** maintains a persistent record of all events
- **Event Monitor** provides a UI for viewing and filtering events

## Contributing

Contributions are welcome! To contribute to the Modular Software Framework:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Implement your changes
4. Write tests for your changes
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- React and Material UI for frontend components
- Flask for the backend framework
- ZeroMQ and Redis for event communication
- SQLite/PostgreSQL for data storage
- Database structure information
- Architecture diagrams
- Flow diagrams
- Sequence diagrams

## License

[MIT License](LICENSE)
