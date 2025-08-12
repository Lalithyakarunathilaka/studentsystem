import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardActionArea,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import GroupIcon from '@mui/icons-material/Group';

const ChooseUser = () => {
  const navigate = useNavigate();

  const handleNavigation = (role) => {
    switch (role) {
      case 'Admin':
        navigate('/admin-login');
        break;
      case 'Student':
        navigate('/register-student');
        break;
      case 'Teacher':
        navigate('/register-teacher');
        break;
      default:
        break;
    }
  };

  const userRoles = [
    {
      role: 'Admin',
      icon: <AdminPanelSettingsIcon sx={{ fontSize: 60, color: '#1976d2' }} />,
      description: 'Login as administrator to access school administration panel',
    },
    {
      role: 'Student',
      icon: <SchoolIcon sx={{ fontSize: 60, color: '#388e3c' }} />,
      description: 'Login as student to access student portal and materials',
    },
    {
      role: 'Teacher',
      icon: <GroupIcon sx={{ fontSize: 60, color: '#f57c00' }} />,
      description: 'Login as teacher to access teacher dashboard and tools',
    },
  ];

  return (
    <Box
      sx={{
        p: 10,
        fontFamily: '"Times New Roman", Times, serif',
        backgroundColor: '#0f294e',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" align="center" gutterBottom sx={{ color: 'white' }}>
        Choose User Role
      </Typography>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <Grid container spacing={4} justifyContent="center" maxWidth="md">
          {userRoles.map(({ role, icon, description }) => (
            <Grid item xs={12} sm={6} md={4} key={role}>
              <Card sx={{ fontFamily: '"Times New Roman", Times, serif' }}>
                <CardActionArea onClick={() => handleNavigation(role)}>
                  <CardContent sx={{ textAlign: 'center', py: 5 }}>
                    {icon}
                    <Typography variant="h6" sx={{ mt: 2 }}>
                      {role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ChooseUser;
