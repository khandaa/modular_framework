import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Dashboard from './components/Dashboard';
import ModuleRegistry from './components/ModuleRegistry';
import Footer from './components/common/Footer';

// Define default layout width
const DRAWER_WIDTH = 240;

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <Header 
          drawerWidth={DRAWER_WIDTH} 
          drawerOpen={drawerOpen} 
          handleDrawerToggle={handleDrawerToggle} 
        />
        <Sidebar 
          drawerWidth={DRAWER_WIDTH} 
          drawerOpen={drawerOpen} 
          handleDrawerToggle={handleDrawerToggle} 
        />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
            marginTop: '64px', // Height of the header
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/modules" element={<ModuleRegistry />} />
            {/* Additional routes will be added dynamically as modules are registered */}
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
}

export default App;
