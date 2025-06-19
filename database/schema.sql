-- Schema for Modular Software Framework
-- Uses tablename_id naming convention for primary keys
-- Master data tables with _master suffix
-- Transactional data tables with _tx suffix

-- Enable foreign key support
PRAGMA foreign_keys = ON;


-- Modules Master Table
CREATE TABLE IF NOT EXISTS modules_master (
    module_id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_name TEXT UNIQUE NOT NULL,
    version TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    installed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Module Dependencies Transaction Table
CREATE TABLE IF NOT EXISTS module_dependencies_tx (
    dependency_id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    required_module_id INTEGER NOT NULL,
    min_version TEXT NOT NULL,
    max_version TEXT,
    FOREIGN KEY (module_id) REFERENCES modules_master(module_id),
    FOREIGN KEY (required_module_id) REFERENCES modules_master(module_id),
    UNIQUE (module_id, required_module_id)
);

-- Events Master Table
CREATE TABLE IF NOT EXISTS events_master (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT UNIQUE NOT NULL,
    description TEXT,
    module_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules_master(module_id)
);

-- Event Subscriptions Transaction Table
CREATE TABLE IF NOT EXISTS event_subscriptions_tx (
    subscription_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    module_id INTEGER NOT NULL,
    callback_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events_master(event_id),
    FOREIGN KEY (module_id) REFERENCES modules_master(module_id)
);

-- Audit Logs Transaction Table
CREATE TABLE IF NOT EXISTS audit_logs_tx (
    audit_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    module_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER NOT NULL,
    old_values TEXT,
    new_values TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address TEXT,
    FOREIGN KEY (user_id) REFERENCES users_master(user_id),
    FOREIGN KEY (module_id) REFERENCES modules_master(module_id)
);

-- Monitoring Metrics Transaction Table
CREATE TABLE IF NOT EXISTS monitoring_metrics_tx (
    metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
    module_id INTEGER NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules_master(module_id)
);

