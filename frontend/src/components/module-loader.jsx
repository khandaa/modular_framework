import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import apiClient from '../lib/api-client';

/**
 * Dynamic Module Loader component
 * Loads frontend modules dynamically based on registered modules
 */
const ModuleLoader = ({ moduleName, fallback, props = {} }) => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if the module is registered in the module registry
        const moduleInfo = await apiClient.get(`/modules/${moduleName}`);
        
        if (!moduleInfo || !moduleInfo.data) {
          throw new Error(`Module "${moduleName}" not found in registry`);
        }
        
        // Get the module's frontend asset path
        const { frontendPath } = moduleInfo.data;
        
        if (!frontendPath) {
          throw new Error(`Module "${moduleName}" does not have a frontend component`);
        }
        
        // Dynamically import the module
        // In production, this would load from a CDN or other source
        // For development, we'll use React.lazy with a direct import
        try {
          // This is a simplified implementation for the prototype
          // In a real application, this would be more sophisticated
          const DynamicComponent = lazy(() => import(`../modules/${frontendPath}`));
          setComponent(() => DynamicComponent);
        } catch (importError) {
          console.error('Module import error:', importError);
          throw new Error(`Failed to load module "${moduleName}": ${importError.message}`);
        }
      } catch (err) {
        console.error('Error loading module:', err);
        setError(err.message || 'Failed to load module');
      } finally {
        setLoading(false);
      }
    };

    if (moduleName) {
      loadComponent();
    }
  }, [moduleName]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        {fallback || <CircularProgress />}
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!Component) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Module not available</Typography>
      </Box>
    );
  }

  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        {fallback || <CircularProgress />}
      </Box>
    }>
      <Component {...props} />
    </Suspense>
  );
};

export default ModuleLoader;
