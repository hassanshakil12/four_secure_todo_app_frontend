import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import axiosInstance from "../api/axiosConfig";
import TaskListCard from "../components/TaskLists/TaskListCard";
import TaskListForm from "../components/TaskLists/TaskListForm";

const TaskLists = () => {
  const [taskLists, setTaskLists] = useState([]);
  const [filteredLists, setFilteredLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedTaskList, setSelectedTaskList] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchTaskLists = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/task-lists");
      setTaskLists(response.data);
      setFilteredLists(response.data);
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

  useEffect(() => {
    let filtered = taskLists;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (list) =>
          list.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          list.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          list.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          list.user?.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filter === "own") {
      filtered = filtered.filter((list) => list.user_id === getCurrentUserId());
    } else if (filter === "shared") {
      filtered = filtered.filter(
        (list) => list.user_id !== getCurrentUserId() && list.is_public
      );
    } else if (filter === "public") {
      filtered = filtered.filter((list) => list.is_public);
    } else if (filter === "private") {
      filtered = filtered.filter((list) => !list.is_public);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "title":
          return a.title.localeCompare(b.title);
        case "tasks":
          return (b.tasks_count || 0) - (a.tasks_count || 0);
        default:
          return 0;
      }
    });

    setFilteredLists(filtered);
  }, [taskLists, searchTerm, filter, sortBy]);

  const getCurrentUserId = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id;
  };

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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Task Lists</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          New List
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search task lists..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Filter by</InputLabel>
              <Select
                value={filter}
                label="Filter by"
                onChange={(e) => setFilter(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <FilterListIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All Lists</MenuItem>
                <MenuItem value="own">My Lists</MenuItem>
                <MenuItem value="shared">Shared with me</MenuItem>
                <MenuItem value="public">Public Lists</MenuItem>
                <MenuItem value="private">Private Lists</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                label="Sort by"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="title">Title (A-Z)</MenuItem>
                <MenuItem value="tasks">Most Tasks</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Stats Chips */}
      <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Chip
          label={`Total: ${taskLists.length}`}
          color="primary"
          variant="outlined"
        />
        <Chip
          label={`My Lists: ${
            taskLists.filter((l) => l.user_id === getCurrentUserId()).length
          }`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`Public: ${taskLists.filter((l) => l.is_public).length}`}
          color="info"
          variant="outlined"
        />
      </Box>

      {/* Task Lists Grid */}
      {filteredLists.length === 0 ? (
        <Alert severity="info">
          {searchTerm
            ? "No task lists found matching your search."
            : "No task lists available. Create your first one!"}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredLists.map((taskList) => (
            <Grid item key={taskList.id} xs={12} sm={6} md={4} lg={3}>
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

export default TaskLists;
