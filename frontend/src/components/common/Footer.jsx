import React from 'react';
import { Box, Container, Typography, Grid, Link, useTheme, useMediaQuery } from '@mui/material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: theme.palette.grey[100],
        borderTop: `1px solid ${theme.palette.divider}`,
        width: '100%',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3} justifyContent={isMobile ? "center" : "space-between"}>
          <Grid item xs={12} sm={4} sx={{ textAlign: isMobile ? 'center' : 'left' }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Modular Software Framework
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A scalable, microservice-like modular software framework
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.primary" gutterBottom>
              Links
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <Link href="/help" color="inherit" sx={{ mx: 1 }}>
                Help
              </Link>
              |
              <Link href="/modules" color="inherit" sx={{ mx: 1 }}>
                Modules
              </Link>
              |
              <Link href="/docs" color="inherit" sx={{ mx: 1 }}>
                Documentation
              </Link>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4} sx={{ textAlign: isMobile ? 'center' : 'right' }}>
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} ModularFW
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Version 0.1.0 | <Link href="/changelog" color="inherit">Changelog</Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;
