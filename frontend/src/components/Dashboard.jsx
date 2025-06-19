import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Chip,
  useTheme,
  Button
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ExtensionIcon from '@mui/icons-material/Extension';
import StorageIcon from '@mui/icons-material/Storage';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({});
  const [recentEvents, setRecentEvents] = useState([]);
  const [activeModules, setActiveModules] = useState([]);
  const theme = useTheme();

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      // Mock data for demonstration
      setSystemStatus({
        api: 'healthy',
        database: 'healthy',
        eventBus: 'healthy',
        modules: 'healthy'
      });
      
      setRecentEvents([
        { id: 1, type: 'USER_LOGIN', timestamp: '2025-06-19T14:30:22', status: 'success' },
        { id: 2, type: 'MODULE_REGISTERED', timestamp: '2025-06-19T13:45:10', status: 'success' },
        { id: 3, type: 'DATABASE_BACKUP', timestamp: '2025-06-19T12:00:00', status: 'success' },
        { id: 4, type: 'API_RATE_LIMIT', timestamp: '2025-06-19T10:15:30', status: 'warning' },
      ]);
      
      setActiveModules([
        { id: 1, name: 'Authentication', status: 'active', version: '1.2.0' },
        { id: 2, name: 'User Management', status: 'active', version: '1.1.0' },
        { id: 3, name: 'Role Management', status: 'active', version: '1.0.1' },
        { id: 4, name: 'Event Logger', status: 'active', version: '1.0.0' },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Dashboard</Typography>
      
      {/* System Status */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <StorageIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Database</Typography>
            <Chip 
              label={systemStatus.database} 
              color={systemStatus.database === 'healthy' ? 'success' : 'error'} 
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <ExtensionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Modules</Typography>
            <Chip 
              label={systemStatus.modules} 
              color={systemStatus.modules === 'healthy' ? 'success' : 'error'} 
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <EventIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Event Bus</Typography>
            <Chip 
              label={systemStatus.eventBus} 
              color={systemStatus.eventBus === 'healthy' ? 'success' : 'error'} 
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
            <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">API</Typography>
            <Chip 
              label={systemStatus.api} 
              color={systemStatus.api === 'healthy' ? 'success' : 'error'} 
              sx={{ mt: 1 }}
            />
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Active Modules */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Active Modules" />
            <Divider />
            <CardContent>
              <List>
                {activeModules.map((module) => (
                  <ListItem key={module.id} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <ExtensionIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={module.name} 
                      secondary={`Version: ${module.version}`}
                    />
                    <Chip 
                      label={module.status} 
                      color="success" 
                      size="small" 
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined" color="primary">
                  View All Modules
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Events" />
            <Divider />
            <CardContent>
              <List>
                {recentEvents.map((event) => (
                  <ListItem key={event.id} sx={{ py: 1 }}>
                    <ListItemIcon>
                      {event.status === 'success' ? (
                        <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                      ) : (
                        <WarningIcon sx={{ color: theme.palette.warning.main }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={event.type} 
                      secondary={new Date(event.timestamp).toLocaleString()}
                    />
                  </ListItem>
                ))}
              </List>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined" color="primary">
                  View Event Log
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
