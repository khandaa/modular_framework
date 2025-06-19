import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock theme and media query hook
jest.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    breakpoints: {
      down: () => false
    },
    transitions: {
      create: () => '',
      easing: {
        sharp: '',
      },
      duration: {
        leavingScreen: 0,
      }
    }
  })
}));

// Mock useMediaQuery
jest.mock('@mui/material', () => {
  const originalModule = jest.requireActual('@mui/material');
  return {
    ...originalModule,
    useMediaQuery: () => false
  };
});

describe('Header Component', () => {
  const mockProps = {
    drawerWidth: 240,
    drawerOpen: false,
    handleDrawerToggle: jest.fn()
  };

  test('renders header with app title', () => {
    render(
      <BrowserRouter>
        <Header {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Modular Software Framework')).toBeInTheDocument();
  });

  test('renders navigation links', () => {
    render(
      <BrowserRouter>
        <Header {...mockProps} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Modules')).toBeInTheDocument();
    expect(screen.getByText('Docs')).toBeInTheDocument();
  });

  test('toggle drawer button exists', () => {
    render(
      <BrowserRouter>
        <Header {...mockProps} />
      </BrowserRouter>
    );
    
    const menuButton = screen.getByLabelText('open drawer');
    expect(menuButton).toBeInTheDocument();
  });
});
