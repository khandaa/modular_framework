import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import GetAppIcon from '@mui/icons-material/GetApp';
import AddIcon from '@mui/icons-material/Add';

// TabPanel component for tabbed content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`module-tabpanel-${index}`}
      aria-labelledby={`module-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ModuleRegistry = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedModule, setSelectedModule] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      // Mock data for demonstration
      setModules([
        {
          id: 1, 
          name: 'Authentication', 
          version: '1.2.0', 
          description: 'Authentication and authorization module',
          status: 'active',
          author: 'Core Team',
          dependencies: ['User Management'],
          events: ['USER_LOGIN', 'USER_LOGOUT', 'TOKEN_EXPIRED'],
          lastUpdated: '2025-05-15'
        },
        {
          id: 2, 
          name: 'User Management', 
          version: '1.1.0', 
          description: 'User creation, profile management, and settings',
          status: 'active',
          author: 'Core Team',
          dependencies: [],
          events: ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED'],
          lastUpdated: '2025-05-10'
        },
        {
          id: 3, 
          name: 'Role Management', 
          version: '1.0.1', 
          description: 'Role-based access control and permissions',
          status: 'active',
          author: 'Core Team',
          dependencies: ['User Management'],
          events: ['ROLE_ASSIGNED', 'PERMISSION_GRANTED'],
          lastUpdated: '2025-04-28'
        },
        {
          id: 4, 
          name: 'Payment Gateway', 
          version: '0.9.0', 
          description: 'Payment processing and subscription management',
          status: 'beta',
          author: 'Financial Services Team',
          dependencies: ['User Management'],
          events: ['PAYMENT_PROCESSED', 'SUBSCRIPTION_UPDATED'],
          lastUpdated: '2025-06-05'
        },
        {
          id: 5, 
          name: 'File Storage', 
          version: '1.0.0', 
          description: 'File upload, storage, and management',
          status: 'active',
          author: 'Infrastructure Team',
          dependencies: [],
          events: ['FILE_UPLOADED', 'FILE_DELETED'],
          lastUpdated: '2025-05-20'
        },
      ]);
      
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh operation
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Filter modules based on search term and tab selection
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (tabValue === 0) return matchesSearch; // All modules
    if (tabValue === 1) return matchesSearch && module.status === 'active';
    if (tabValue === 2) return matchesSearch && module.status !== 'active';
    
    return false;
  });

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap' }}>
        <Typography variant="h4">Module Registry</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          sx={{ mt: isMobile ? 2 : 0 }}
        >
          Register New Module
        </Button>
      </Box>

      {/* Search and filter section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search modules..."
                variant="outlined"
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant={isMobile ? "scrollable" : "standard"}
                scrollButtons={isMobile ? "auto" : false}
              >
                <Tab label="All Modules" />
                <Tab label="Active" />
                <Tab label="Development" />
              </Tabs>
            </Grid>
            <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton onClick={handleRefresh} color="primary" aria-label="refresh modules">
                <RefreshIcon />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Modules Table */}
      <TabPanel value={tabValue} index={tabValue}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Version</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Last Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredModules.length > 0 ? (
                filteredModules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>{module.name}</TableCell>
                    <TableCell>{module.version}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {module.description}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={module.status} 
                        color={module.status === 'active' ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      {module.lastUpdated}
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={() => handleModuleSelect(module)}>
                        <InfoIcon />
                      </IconButton>
                      <IconButton size="small" color="primary">
                        <GetAppIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No modules found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Module Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        {selectedModule && (
          <>
            <DialogTitle>
              {selectedModule.name} 
              <Chip 
                label={`v${selectedModule.version}`} 
                size="small" 
                sx={{ ml: 1 }} 
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Description</Typography>
                  <Typography variant="body2">{selectedModule.description}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>Status</Typography>
                  <Chip 
                    label={selectedModule.status} 
                    color={selectedModule.status === 'active' ? 'success' : 'warning'} 
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1" gutterBottom>Author</Typography>
                  <Typography variant="body2">{selectedModule.author}</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Dependencies</Typography>
                  {selectedModule.dependencies.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedModule.dependencies.map((dep, index) => (
                        <Chip key={index} label={dep} variant="outlined" size="small" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">No dependencies</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Published Events</Typography>
                  {selectedModule.events.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedModule.events.map((event, index) => (
                        <Chip key={index} label={event} size="small" />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2">No events published</Typography>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>Last Updated</Typography>
                  <Typography variant="body2">{selectedModule.lastUpdated}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
              <Button variant="contained" color="primary">Use Module</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ModuleRegistry;
