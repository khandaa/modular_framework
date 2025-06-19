import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { apiClient } from '../lib/api-client';

// Custom styles for priority levels
const priorityColors = {
  low: '#4caf50',
  normal: '#2196f3',
  high: '#ff9800',
  critical: '#f44336'
};

/**
 * Event Monitor Component
 * Displays real-time system events with filtering and sorting options
 */
const EventMonitor = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filters, setFilters] = useState({
    eventType: '',
    sourceModule: '',
    priority: '',
    startDate: '',
    endDate: ''
  });
  
  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params for filtering
      const params = new URLSearchParams();
      
      if (filters.eventType) params.append('event_type', filters.eventType);
      if (filters.sourceModule) params.append('source_module', filters.sourceModule);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.startDate) params.append('start_time', new Date(filters.startDate).toISOString());
      if (filters.endDate) params.append('end_time', new Date(filters.endDate).toISOString());
      
      const response = await apiClient.get(`/api/events/?${params.toString()}`);
      setEvents(response.data.events || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load and refresh
  useEffect(() => {
    fetchEvents();
    
    // Setup periodic refresh (every 30 seconds)
    const intervalId = setInterval(fetchEvents, 30000);
    
    return () => clearInterval(intervalId);
  }, [filters]);
  
  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value
    });
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // View event details
  const handleViewEvent = (event) => {
    setSelectedEvent(event);
  };
  
  // Close event details dialog
  const handleCloseEventDialog = () => {
    setSelectedEvent(null);
  };
  
  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">Event Monitor</Typography>
        
        <Box>
          <IconButton onClick={() => setFilterOpen(!filterOpen)} color="primary">
            <FilterListIcon />
          </IconButton>
          <IconButton onClick={fetchEvents} disabled={loading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Filters */}
      {filterOpen && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Event Type"
                value={filters.eventType}
                onChange={(e) => handleFilterChange('eventType', e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Source Module"
                value={filters.sourceModule}
                onChange={(e) => handleFilterChange('sourceModule', e.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority}
                  label="Priority"
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="normal">Normal</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="Start Date"
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                label="End Date"
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Error message */}
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: '#ffebee' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}
      
      {/* Events table */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Event Type</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !events.length ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading events...</TableCell>
              </TableRow>
            ) : !events.length ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No events found</TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.event_id} hover>
                  <TableCell>{formatDate(event.timestamp)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {event.event_type}
                    </Typography>
                  </TableCell>
                  <TableCell>{event.source_module}</TableCell>
                  <TableCell>
                    <Chip 
                      label={event.priority || 'normal'}
                      size="small"
                      sx={{ 
                        bgcolor: priorityColors[event.priority || 'normal'],
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewEvent(event)}>
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Event details dialog */}
      <Dialog open={!!selectedEvent} onClose={handleCloseEventDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Event Details: {selectedEvent?.event_type}
        </DialogTitle>
        <DialogContent>
          {selectedEvent && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Event ID</Typography>
                  <Typography variant="body2" fontFamily="monospace" gutterBottom>
                    {selectedEvent.event_id}
                  </Typography>
                  
                  <Typography variant="subtitle2">Timestamp</Typography>
                  <Typography variant="body2" gutterBottom>
                    {formatDate(selectedEvent.timestamp)}
                  </Typography>
                  
                  <Typography variant="subtitle2">Source Module</Typography>
                  <Typography variant="body2" gutterBottom>
                    {selectedEvent.source_module} 
                    {selectedEvent.source_version && ` (v${selectedEvent.source_version})`}
                  </Typography>
                  
                  <Typography variant="subtitle2">Priority</Typography>
                  <Typography variant="body2" gutterBottom>
                    <Chip 
                      label={selectedEvent.priority || 'normal'}
                      size="small"
                      sx={{ 
                        bgcolor: priorityColors[selectedEvent.priority || 'normal'],
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Correlation ID</Typography>
                  <Typography variant="body2" fontFamily="monospace" gutterBottom>
                    {selectedEvent.correlation_id || 'N/A'}
                  </Typography>
                  
                  <Typography variant="subtitle2">Causation ID</Typography>
                  <Typography variant="body2" fontFamily="monospace" gutterBottom>
                    {selectedEvent.causation_id || 'N/A'}
                  </Typography>
                </Grid>
              </Grid>
              
              <Typography variant="subtitle1" mt={2}>Event Data</Typography>
              <Paper 
                elevation={0} 
                sx={{ 
                  bgcolor: '#f5f5f5', 
                  p: 2, 
                  mt: 1, 
                  maxHeight: 300, 
                  overflow: 'auto',
                  fontFamily: 'monospace'
                }}
              >
                <pre style={{ margin: 0 }}>
                  {JSON.stringify(selectedEvent.data, null, 2)}
                </pre>
              </Paper>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEventDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EventMonitor;
