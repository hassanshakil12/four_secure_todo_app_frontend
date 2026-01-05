import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  List as ListIcon,
  Task as TaskIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import axiosInstance from "../api/axiosConfig";

const profileSchema = yup.object().shape({
  name: yup.string().required("Name is required").max(255, "Name too long"),
  username: yup
    .string()
    .required("Username is required")
    .max(255, "Username too long"),
  email: yup.string().email("Invalid email").required("Email is required"),
});

const passwordSchema = yup.object().shape({
  current_password: yup.string().required("Current password is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [taskLists, setTaskLists] = useState([]);
  const [stats, setStats] = useState({
    totalLists: 0,
    publicLists: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: user || {},
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  useEffect(() => {
    if (user) {
      resetProfile(user);
      fetchUserStats();
      fetchUserTaskLists();
    }
  }, [user, resetProfile]);

  const fetchUserStats = async () => {
    try {
      const response = await axiosInstance.get("/task-lists");
      const userLists = response.data.filter(
        (list) => list.user_id === user.id
      );
      const allTasks = userLists.flatMap((list) => list.tasks || []);

      setStats({
        totalLists: userLists.length,
        publicLists: userLists.filter((list) => list.is_public).length,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter((task) => task.is_completed).length,
      });
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    }
  };

  const fetchUserTaskLists = async () => {
    try {
      const response = await axiosInstance.get("/task-lists");
      const userLists = response.data.filter(
        (list) => list.user_id === user.id
      );
      setTaskLists(userLists.slice(0, 5)); // Show only 5 recent lists
    } catch (err) {
      console.error("Failed to fetch user task lists:", err);
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const result = await updateProfile(data);
      if (result.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError("Failed to update profile");
      }
    } catch (err) {
      setError("An error occurred while updating profile");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    try {
      setLoading(true);
      setError("");

      // Note: You'll need to create a password change endpoint in Laravel
      // const response = await axiosInstance.put('/user/password', data);

      setSuccess("Password changed successfully!");
      setPasswordDialogOpen(false);
      resetPassword();
    } catch (err) {
      setError("Failed to change password");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    resetProfile(user);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Left Column - Profile Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: "primary.main",
                  fontSize: "2.5rem",
                }}
              >
                {getInitials(user.name)}
              </Avatar>

              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography color="textSecondary" gutterBottom>
                @{user.username}
              </Typography>
              <Chip
                icon={<EmailIcon />}
                label={user.email}
                variant="outlined"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Account Information
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <CalendarIcon
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
                <Typography variant="body2">
                  Member since {formatDate(user.created_at)}
                </Typography>
              </Box>
              {user.updated_at && (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <EditIcon
                    fontSize="small"
                    sx={{ mr: 1, color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    Last updated {formatDate(user.updated_at)}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setPasswordDialogOpen(true)}
                sx={{ mb: 2 }}
              >
                Change Password
              </Button>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Middle Column - Edit Form */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Typography variant="h6">Edit Profile</Typography>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancelEdit}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={<SaveIcon />}
                    variant="contained"
                    onClick={handleProfileSubmit(handleProfileUpdate)}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </Box>
              )}
            </Box>

            <form>
              <TextField
                fullWidth
                label="Name"
                {...registerProfile("name")}
                error={!!profileErrors.name}
                helperText={profileErrors.name?.message}
                margin="normal"
                disabled={!isEditing || loading}
              />

              <TextField
                fullWidth
                label="Username"
                {...registerProfile("username")}
                error={!!profileErrors.username}
                helperText={profileErrors.username?.message}
                margin="normal"
                disabled={!isEditing || loading}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                {...registerProfile("email")}
                error={!!profileErrors.email}
                helperText={profileErrors.email?.message}
                margin="normal"
                disabled={!isEditing || loading}
              />
            </form>
          </Paper>

          {/* Recent Task Lists */}
          <Paper sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Recent Task Lists
            </Typography>
            {taskLists.length === 0 ? (
              <Typography color="textSecondary" sx={{ py: 2 }}>
                No task lists created yet
              </Typography>
            ) : (
              <List>
                {taskLists.map((list) => (
                  <ListItem
                    key={list.id}
                    secondaryAction={
                      <Chip
                        label={list.is_public ? "Public" : "Private"}
                        size="small"
                        color={list.is_public ? "success" : "default"}
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <ListIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={list.title}
                      secondary={`${list.tasks_count || 0} tasks`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Stats */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Your Statistics
            </Typography>

            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar sx={{ bgcolor: "primary.light", mr: 2 }}>
                  <ListIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.totalLists}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Task Lists
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar sx={{ bgcolor: "success.light", mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.publicLists}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Public Lists
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Avatar sx={{ bgcolor: "warning.light", mr: 2 }}>
                  <TaskIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.totalTasks}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Tasks
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar sx={{ bgcolor: "info.light", mr: 2 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5">{stats.completedTasks}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed Tasks
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" color="textSecondary" align="center">
              {stats.completedTasks > 0 && stats.totalTasks > 0
                ? `Completion rate: ${Math.round(
                    (stats.completedTasks / stats.totalTasks) * 100
                  )}%`
                : "No tasks completed yet"}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <form onSubmit={handlePasswordSubmit(handlePasswordChange)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              {...registerPassword("current_password")}
              error={!!passwordErrors.current_password}
              helperText={passwordErrors.current_password?.message}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="New Password"
              type="password"
              {...registerPassword("password")}
              error={!!passwordErrors.password}
              helperText={passwordErrors.password?.message}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              {...registerPassword("password_confirmation")}
              error={!!passwordErrors.password_confirmation}
              helperText={passwordErrors.password_confirmation?.message}
              margin="normal"
              disabled={loading}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPasswordDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Changing..." : "Change Password"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Warning: This action cannot be undone. All your data will be
            permanently deleted.
          </Alert>
          <Typography>
            Are you sure you want to delete your account? This will remove:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="All your task lists" />
            </ListItem>
            <ListItem>
              <ListItemText primary="All your tasks" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Your profile information" />
            </ListItem>
          </List>
          <TextField
            fullWidth
            label="Type 'DELETE' to confirm"
            margin="normal"
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button color="error" variant="contained" disabled={loading}>
            {loading ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
