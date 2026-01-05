import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  List as ListIcon,
} from "@mui/icons-material";

const TaskListCard = ({ taskList, onDelete, onEdit }) => {
  const isOwner =
    taskList.user_id === parseInt(localStorage.getItem("user")?.id || 0);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography variant="h6" component="h2" gutterBottom>
            {taskList.title}
          </Typography>
          <Box>
            {taskList.is_public && (
              <Chip
                label="Public"
                color="success"
                size="small"
                sx={{ mr: 1 }}
              />
            )}
            {!isOwner && <Chip label="Shared" color="info" size="small" />}
          </Box>
        </Box>

        <Typography color="textSecondary" gutterBottom>
          By: {taskList.user?.name || taskList.user?.username}
        </Typography>

        <Typography variant="body2" color="textSecondary" paragraph>
          {taskList.description || "No description"}
        </Typography>

        <Box display="flex" alignItems="center" mt={2}>
          <ListIcon fontSize="small" sx={{ mr: 1 }} />
          <Typography variant="body2">
            {taskList.tasks_count || taskList.tasks?.length || 0} tasks
          </Typography>
        </Box>
      </CardContent>

      <CardActions>
        <Button
          size="small"
          component={RouterLink}
          to={`/task-lists/${taskList.id}`}
          startIcon={<VisibilityIcon />}
        >
          View
        </Button>

        {isOwner && (
          <>
            <Button
              size="small"
              onClick={() => onEdit(taskList)}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
            <Button
              size="small"
              color="error"
              onClick={() => onDelete(taskList.id)}
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
          </>
        )}
      </CardActions>
    </Card>
  );
};

export default TaskListCard;
