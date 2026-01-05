import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  IconButton,
  List,
  Divider,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Home as HomeIcon,
  List as ListIcon,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axiosInstance from "../api/axiosConfig";
import TaskItem from "../components/Tasks/TaskItem";

const taskSchema = yup.object().shape({
  title: yup.string().required("Title is required").max(255, "Title too long"),
  description: yup.string().max(1000, "Description too long"),
});

const TaskListDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [taskList, setTaskList] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editTaskListOpen, setEditTaskListOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const {
    register: registerTaskForm,
    handleSubmit: handleTaskSubmit,
    formState: { errors: taskErrors },
    reset: resetTaskForm,
  } = useForm({
    resolver: yupResolver(taskSchema),
  });

  const {
    register: registerTaskListForm,
    handleSubmit: handleTaskListSubmit,
    formState: { errors: taskListErrors },
    watch: watchTaskListForm,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      is_public: false,
    },
  });

  const fetchTaskListDetails = async () => {
    try {
      setLoading(true);
      const [listResponse, tasksResponse] = await Promise.all([
        axiosInstance.get(`/task-lists/${id}`),
        axiosInstance.get(`/task-lists/${id}`), // Tasks are included in the response
      ]);

      setTaskList(listResponse.data);
      setTasks(listResponse.data.tasks || []);

      // Update stats
      const completed = (listResponse.data.tasks || []).filter(
        (task) => task.is_completed
      ).length;
      const total = (listResponse.data.tasks || []).length;
      setStats({
        total,
        completed,
        pending: total - completed,
      });

      setError("");
    } catch (err) {
      if (err.response?.status === 403) {
        setError("You do not have permission to view this task list");
      } else if (err.response?.status === 404) {
        setError("Task list not found");
        navigate("/task-lists");
      } else {
        setError("Failed to load task list");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskListDetails();
  }, [id]);

  const isOwner = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return taskList && taskList.user_id === user.id;
  };

  const handleCreateTask = async (data) => {
    try {
      await axiosInstance.post(`/task-lists/${id}/tasks`, data);
      setTaskFormOpen(false);
      resetTaskForm();
      fetchTaskListDetails();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const handleUpdateTask = async (data) => {
    try {
      await axiosInstance.put(`/tasks/${selectedTask.id}`, data);
      setTaskFormOpen(false);
      setSelectedTask(null);
      resetTaskForm();
      fetchTaskListDetails();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      await axiosInstance.put(`/tasks/${taskId}`, { is_completed: completed });
      fetchTaskListDetails();
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axiosInstance.delete(`/tasks/${taskId}`);
        fetchTaskListDetails();
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    }
  };

  const handleUpdateTaskList = async (data) => {
    try {
      await axiosInstance.put(`/task-lists/${id}`, data);
      setEditTaskListOpen(false);
      fetchTaskListDetails();
    } catch (err) {
      console.error("Failed to update task list:", err);
    }
  };

  const handleDeleteTaskList = async () => {
    try {
      await axiosInstance.delete(`/task-lists/${id}`);
      setDeleteConfirmOpen(false);
      navigate("/task-lists");
    } catch (err) {
      console.error("Failed to delete task list:", err);
    }
  };

  const handleTaskFormOpen = (task = null) => {
    setSelectedTask(task);
    if (task) {
      resetTaskForm({
        title: task.title,
        description: task.description || "",
      });
    } else {
      resetTaskForm({
        title: "",
        description: "",
      });
    }
    setTaskFormOpen(true);
  };

  const handleTaskFormClose = () => {
    setTaskFormOpen(false);
    setSelectedTask(null);
    resetTaskForm();
  };

  useEffect(() => {
    if (taskList && editTaskListOpen) {
      registerTaskListForm("title").onChange({
        target: { value: taskList.title },
      });
      registerTaskListForm("description").onChange({
        target: { value: taskList.description || "" },
      });
      registerTaskListForm("is_public").onChange({
        target: { value: taskList.is_public },
      });
    }
  }, [taskList, editTaskListOpen, registerTaskListForm]);

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

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink
          component={RouterLink}
          to="/"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </MuiLink>
        <MuiLink
          component={RouterLink}
          to="/task-lists"
          color="inherit"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Task Lists
        </MuiLink>
        <Typography color="text.primary">{taskList?.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant="h4" component="h1" sx={{ mr: 2 }}>
                {taskList?.title}
              </Typography>
              {taskList?.is_public && (
                <Chip label="Public" color="success" size="small" />
              )}
            </Box>

            <Typography color="textSecondary" paragraph>
              Created by: {taskList?.user?.name || taskList?.user?.username}
            </Typography>

            {taskList?.description && (
              <Typography paragraph sx={{ mt: 2 }}>
                {taskList.description}
              </Typography>
            )}
          </Box>

          {isOwner() && (
            <Box>
              <IconButton
                onClick={() => setEditTaskListOpen(true)}
                sx={{ mr: 1 }}
                color="primary"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() => setDeleteConfirmOpen(true)}
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" color="primary">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Tasks
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" color="success">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="h6" color="warning">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Pending
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Tasks Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5">Tasks</Typography>
          {isOwner() && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleTaskFormOpen()}
            >
              Add Task
            </Button>
          )}
        </Box>

        {tasks.length === 0 ? (
          <Alert severity="info">
            No tasks in this list yet.{" "}
            {isOwner()
              ? "Add your first task!"
              : "The list owner hasn't added any tasks yet."}
          </Alert>
        ) : (
          <List>
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <TaskItem
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={() => handleTaskFormOpen(task)}
                  onDelete={handleDeleteTask}
                  isOwner={isOwner()}
                />
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        component={RouterLink}
        to="/task-lists"
        sx={{ mt: 4 }}
      >
        Back to Task Lists
      </Button>

      {/* Task Form Dialog */}
      <Dialog
        open={taskFormOpen}
        onClose={handleTaskFormClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        <form
          onSubmit={handleTaskSubmit(
            selectedTask ? handleUpdateTask : handleCreateTask
          )}
        >
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              {...registerTaskForm("title")}
              error={!!taskErrors.title}
              helperText={taskErrors.title?.message}
              margin="normal"
              autoFocus
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              {...registerTaskForm("description")}
              error={!!taskErrors.description}
              helperText={taskErrors.description?.message}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleTaskFormClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedTask ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Task List Dialog */}
      <Dialog
        open={editTaskListOpen}
        onClose={() => setEditTaskListOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Task List</DialogTitle>
        <form onSubmit={handleTaskListSubmit(handleUpdateTaskList)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Title"
              {...registerTaskListForm("title")}
              error={!!taskListErrors.title}
              helperText={taskListErrors.title?.message}
              margin="normal"
              defaultValue={taskList?.title}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={4}
              {...registerTaskListForm("description")}
              error={!!taskListErrors.description}
              helperText={taskListErrors.description?.message}
              margin="normal"
              defaultValue={taskList?.description || ""}
            />

            <FormControlLabel
              control={
                <Switch
                  {...registerTaskListForm("is_public")}
                  defaultChecked={taskList?.is_public}
                />
              }
              label="Make this list public"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditTaskListOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Task List</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{taskList?.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteTaskList}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskListDetail;
