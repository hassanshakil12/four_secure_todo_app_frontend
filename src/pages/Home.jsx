import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Container, Typography, Button, Box, Paper, Grid } from "@mui/material";
import {
  List as ListIcon,
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const Home = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 8, textAlign: "center" }}>
        <Typography variant="h2" component="h1" gutterBottom>
          TaskList Manager
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Create, share, and manage your task lists with others
        </Typography>

        <Box sx={{ mt: 4, mb: 6 }}>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to="/register"
            sx={{ mr: 2 }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={RouterLink}
            to="/login"
          >
            Login
          </Button>
        </Box>

        <Grid container spacing={4} sx={{ mt: 8 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <ListIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Create Task Lists
              </Typography>
              <Typography color="textSecondary">
                Organize your tasks into customizable lists with descriptions
                and due dates.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <GroupIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Share with Others
              </Typography>
              <Typography color="textSecondary">
                Make your lists public or share them with specific users for
                collaboration.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <CheckCircleIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Track Progress
              </Typography>
              <Typography color="textSecondary">
                Mark tasks as complete and track your progress across all lists.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;
