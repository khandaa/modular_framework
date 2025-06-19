import React from 'react';
import DataTable from './DataTable';
import { Box, Chip, Button } from '@mui/material';

export default {
  title: 'Components/DataTable',
  component: DataTable,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'An advanced data table with sorting, filtering, and pagination capabilities',
  },
};

// Generate mock data
const generateMockData = (count = 100) => {
  const statuses = ['active', 'inactive', 'pending', 'archived'];
  const types = ['user', 'admin', 'guest', 'support'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    type: types[Math.floor(Math.random() * types.length)],
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    count: Math.floor(Math.random() * 1000),
    price: parseFloat((Math.random() * 1000).toFixed(2)),
    isActive: Math.random() > 0.3,
  }));
};

// Define columns
const columns = [
  { id: 'id', label: 'ID', numeric: true },
  { id: 'name', label: 'Name' },
  { id: 'description', label: 'Description' },
  {
    id: 'status',
    label: 'Status',
    render: (value) => {
      const getColor = () => {
        switch (value) {
          case 'active': return 'success';
          case 'inactive': return 'error';
          case 'pending': return 'warning';
          case 'archived': return 'default';
          default: return 'primary';
        }
      };
      
      return (
        <Chip
          label={value}
          color={getColor()}
          size="small"
          variant="filled"
        />
      );
    }
  },
  { id: 'type', label: 'Type' },
  {
    id: 'createdAt',
    label: 'Created At',
    render: (value) => value.toLocaleDateString()
  },
  { id: 'count', label: 'Count', numeric: true },
  {
    id: 'price',
    label: 'Price',
    numeric: true,
    render: (value) => `$${value.toFixed(2)}`
  },
  {
    id: 'isActive',
    label: 'Active',
    render: (value) => (value ? 'Yes' : 'No')
  },
];

// Template for creating stories
const Template = (args) => <DataTable {...args} />;

// Basic DataTable
export const Basic = Template.bind({});
Basic.args = {
  title: 'Basic Data Table',
  data: generateMockData(50),
  columns: columns,
  defaultSortColumn: 'id',
  defaultSortDirection: 'asc',
};

// Sorting Example
export const WithSorting = Template.bind({});
WithSorting.args = {
  title: 'Data Table with Sorting',
  data: generateMockData(50),
  columns: columns,
  defaultSortColumn: 'name',
  defaultSortDirection: 'asc',
};

// Loading State
export const Loading = Template.bind({});
Loading.args = {
  title: 'Loading Data Table',
  data: [],
  columns: columns,
  loading: true,
};

// Error State
export const WithError = Template.bind({});
WithError.args = {
  title: 'Error State',
  data: [],
  columns: columns,
  error: 'Failed to load data. Please try again later.',
};

// Empty State
export const Empty = Template.bind({});
Empty.args = {
  title: 'Empty Data Table',
  data: [],
  columns: columns,
  emptyMessage: 'No records found. Try changing your search criteria.',
};

// With Row Click
export const WithRowClick = Template.bind({});
WithRowClick.args = {
  title: 'Interactive Rows',
  data: generateMockData(20),
  columns: columns,
  onRowClick: (row) => alert(`Row clicked: ${JSON.stringify(row.id)}`),
};

// With Custom Footer
export const WithFooter = Template.bind({});
WithFooter.args = {
  title: 'Table with Footer Content',
  data: generateMockData(25),
  columns: columns,
  footerContent: (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
      <Button variant="outlined" size="small">Export</Button>
      <Button variant="contained" size="small" color="primary">Create New</Button>
    </Box>
  ),
};

// With Refresh
export const WithRefresh = Template.bind({});
WithRefresh.args = {
  title: 'Refreshable Data Table',
  data: generateMockData(15),
  columns: columns,
  onRefresh: () => alert('Refresh requested'),
};

// Dense Table
export const Dense = Template.bind({});
Dense.args = {
  title: 'Condensed Table',
  data: generateMockData(50),
  columns: columns.map(col => ({ ...col, minWidth: 80 })),
};

// With Fewer Columns (Mobile Friendly)
export const MobileFriendly = Template.bind({});
MobileFriendly.args = {
  title: 'Mobile Friendly Table',
  data: generateMockData(10),
  columns: [
    { id: 'name', label: 'Name' },
    { id: 'status', label: 'Status', render: (value) => (
      <Chip label={value} color={value === 'active' ? 'success' : 'error'} size="small" />
    )},
    { id: 'type', label: 'Type' },
  ],
};
