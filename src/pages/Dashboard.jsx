import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import {
  List as ListIcon,
  CheckCircle as CheckCircleIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import axiosInstance from "../api/axiosConfig";
import TaskListCard from "../components/TaskLists/TaskListCard";
import TaskListForm from "../components/TaskLists/TaskListForm";

const Dashboard = () => {
  const [taskLists, setTaskLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTaskList, setSelectedTaskList] = useState(null);

  const fetchTaskLists = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/task-lists");
      setTaskLists(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch task lists");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskLists();
  }, []);

  const handleCreateTaskList = async (data) => {
    try {
      await axiosInstance.post("/task-lists", data);
      setFormOpen(false);
      fetchTaskLists();
    } catch (err) {
      console.error("Failed to create task list:", err);
    }
  };

  const handleUpdateTaskList = async (data) => {
    try {
      await axiosInstance.put(`/task-lists/${selectedTaskList.id}`, data);
      setFormOpen(false);
      setSelectedTaskList(null);
      fetchTaskLists();
    } catch (err) {
      console.error("Failed to update task list:", err);
    }
  };

  const handleDeleteTaskList = async (id) => {
    if (window.confirm("Are you sure you want to delete this task list?")) {
      try {
        await axiosInstance.delete(`/task-lists/${id}`);
        fetchTaskLists();
      } catch (err) {
        console.error("Failed to delete task list:", err);
      }
    }
  };

  const stats = {
    totalLists: taskLists.length,
    publicLists: taskLists.filter((list) => list.is_public).length,
    completedTasks: taskLists.reduce((total, list) => {
      return (
        total + (list.tasks?.filter((task) => task.is_completed).length || 0)
      );
    }, 0),
    totalTasks: taskLists.reduce((total, list) => {
      return total + (list.tasks?.length || 0);
    }, 0),
  };

  if (loading) {
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ListIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalLists}</Typography>
                  <Typography color="textSecondary">Task Lists</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <GroupIcon color="success" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.publicLists}</Typography>
                  <Typography color="textSecondary">Public Lists</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <CheckCircleIcon color="warning" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.completedTasks}</Typography>
                  <Typography color="textSecondary">Completed Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ListIcon color="info" sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4">{stats.totalTasks}</Typography>
                  <Typography color="textSecondary">Total Tasks</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Lists */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h5">Your Task Lists</Typography>
        <Button variant="contained" onClick={() => setFormOpen(true)}>
          Create New List
        </Button>
      </Box>

      {taskLists.length === 0 ? (
        <Alert severity="info">
          You don't have any task lists yet. Create your first one!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {taskLists.map((taskList) => (
            <Grid item key={taskList.id} xs={12} sm={6} md={4}>
              <TaskListCard
                taskList={taskList}
                onDelete={handleDeleteTaskList}
                onEdit={(list) => {
                  setSelectedTaskList(list);
                  setFormOpen(true);
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Task List Form */}
      <TaskListForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedTaskList(null);
        }}
        onSubmit={
          selectedTaskList ? handleUpdateTaskList : handleCreateTaskList
        }
        initialData={selectedTaskList}
      />
    </Box>
  );
};

export default Dashboard;
