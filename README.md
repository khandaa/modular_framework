# Modular Software Framework

A comprehensive framework for building modular, reusable software components that can be independently deployed and scaled like microservices. This framework enables rapid application development by providing pluggable modules for common functionality.

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
├── backend/            # Backend Flask modules
├── frontend/           # React frontend modules and components
├── database/           # Database schema and migrations
│   ├── schema.sql      # SQLite schema definition
│   └── modular_framework.db # SQLite database
├── docs/               # Documentation
│   └── help.md         # Help documentation with architecture diagrams
└── tasks/              # Project requirements and specifications
    └── prd-modular-software-framework.md # Product Requirements Document
```

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
- Docker (optional, for containerization)

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/modular-software-framework.git
   cd modular-software-framework
   ```

2. Set up Python virtual environment
   ```bash
   # Use existing virtual environment at /Users/alokk/EmployDEX/venv or create if not present
   python -m venv /Users/alokk/EmployDEX/venv
   source /Users/alokk/EmployDEX/venv/bin/activate
   pip install -r requirements.txt
   ```

3. Set up frontend dependencies
   ```bash
   # Use node_modules at /Users/alokk/EmployDEX/node_modules or install locally
   cd frontend
   npm install
   ```

4. Initialize the database
   ```bash
   cd database
   sqlite3 modular_framework.db < schema.sql
   ```

### Running the Application

1. Start the backend
   ```bash
   source /Users/alokk/EmployDEX/venv/bin/activate
   cd backend
   flask run
   ```

2. Start the frontend
   ```bash
   cd frontend
   npm start
   ```

## Default Credentials

- Username: `admin`
- Password: `admin`

## Documentation

Refer to the [help documentation](./docs/help.md) for:
- Database structure information
- Architecture diagrams
- Flow diagrams
- Sequence diagrams

## License

[MIT License](LICENSE)
