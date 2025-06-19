import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Toolbar,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * Enhanced data table component with sorting, filtering, and pagination
 */
const DataTable = ({
  title,
  data,
  columns,
  defaultSortColumn,
  defaultSortDirection,
  onRowClick,
  selectable,
  loading,
  error,
  onRefresh,
  footerContent,
  emptyMessage
}) => {
  // State
  const [sortColumn, setSortColumn] = useState(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState(defaultSortDirection);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  // Update filtered data when data changes or filter text changes
  useEffect(() => {
    if (!filterText.trim()) {
      setFilteredData(data);
      return;
    }

    const searchTerm = filterText.toLowerCase();
    const filtered = data.filter(row => {
      return columns.some(column => {
        const value = row[column.id];
        if (value === null || value === undefined) return false;
        return String(value).toLowerCase().includes(searchTerm);
      });
    });

    setFilteredData(filtered);
    setPage(0); // Reset to first page when filtering
  }, [data, filterText, columns]);

  // Sort function
  const handleSort = (columnId) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortColumn(columnId);
  };

  const sortData = (dataToSort) => {
    if (!sortColumn) return dataToSort;

    return [...dataToSort].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle null or undefined values
      if (aValue === null || aValue === undefined) return sortDirection === 'asc' ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === 'asc' ? 1 : -1;
      
      // Compare based on data type
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle dates
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Default string comparison
      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      return sortDirection === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Filter handler
  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  // Get current page data
  const getCurrentPageData = () => {
    const sorted = sortData(filteredData);
    return sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  };

  // Cell renderer
  const renderCellContent = (row, column) => {
    const value = row[column.id];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return value.toLocaleString();
    }
    
    return value;
  };

  return (
    <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
      {/* Toolbar with title and actions */}
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 }
        }}
      >
        {/* Title */}
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          component="div"
          id="tableTitle"
        >
          {title}
        </Typography>
        
        {/* Search */}
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search..."
          value={filterText}
          onChange={handleFilterChange}
          sx={{ mr: 2, width: { xs: '100%', sm: 'auto' } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        
        {/* Filter button */}
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        
        {/* Refresh button */}
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>
      
      {/* Loading indicator */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 2
          }}
        >
          <CircularProgress size={32} />
        </Box>
      )}
      
      {/* Error message */}
      {error && (
        <Box
          sx={{
            p: 2,
            backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1)
          }}
        >
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}
      
      {/* Table */}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader aria-label={title || "data-table"}>
          {/* Table header */}
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? 'right' : 'left'}
                  sortDirection={sortColumn === column.id ? sortDirection : false}
                  sx={{
                    width: column.width,
                    minWidth: column.minWidth,
                    backgroundColor: (theme) => theme.palette.background.default
                  }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          {/* Table body */}
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  {loading ? 'Loading data...' : emptyMessage || 'No data available'}
                </TableCell>
              </TableRow>
            ) : (
              getCurrentPageData().map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={row.id || index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id || index}-${column.id}`}
                      align={column.numeric ? 'right' : 'left'}
                    >
                      {renderCellContent(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        
        {/* Optional footer content */}
        {footerContent && (
          <Box sx={{ p: 2 }}>
            {footerContent}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

DataTable.propTypes = {
  /**
   * Table title displayed in the header
   */
  title: PropTypes.string,
  /**
   * Array of data objects to be displayed in the table
   */
  data: PropTypes.array.isRequired,
  /**
   * Array of column configuration objects
   */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      /** Unique identifier for the column, should match the key in data objects */
      id: PropTypes.string.isRequired,
      /** Display label for the column header */
      label: PropTypes.string.isRequired,
      /** Whether the column values are numeric */
      numeric: PropTypes.bool,
      /** Whether the column can be sorted */
      sortable: PropTypes.bool,
      /** Custom render function for cell values */
      render: PropTypes.func,
      /** Fixed width for the column (e.g., '120px' or '10%') */
      width: PropTypes.string,
      /** Minimum width for the column */
      minWidth: PropTypes.number,
    })
  ).isRequired,
  /**
   * Default column to sort by
   */
  defaultSortColumn: PropTypes.string,
  /**
   * Default sort direction ('asc' or 'desc')
   */
  defaultSortDirection: PropTypes.oneOf(['asc', 'desc']),
  /**
   * Callback function when a row is clicked
   */
  onRowClick: PropTypes.func,
  /**
   * Whether rows can be selected
   */
  selectable: PropTypes.bool,
  /**
   * Whether the table is in a loading state
   */
  loading: PropTypes.bool,
  /**
   * Error message to display if there's an error loading data
   */
  error: PropTypes.string,
  /**
   * Callback function to refresh the data
   */
  onRefresh: PropTypes.func,
  /**
   * Custom content to display in the table footer
   */
  footerContent: PropTypes.node,
  /**
   * Message to display when there's no data
   */
  emptyMessage: PropTypes.string,
};

DataTable.defaultProps = {
  title: '',
  defaultSortColumn: '',
  defaultSortDirection: 'asc',
  selectable: false,
  loading: false,
  error: null,
  emptyMessage: 'No data available',
};

export default DataTable;
