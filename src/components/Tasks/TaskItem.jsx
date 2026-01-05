import React from "react";
import {
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const TaskItem = ({ task, onToggle, onEdit, onDelete, isOwner }) => {
  return (
    <ListItem
      sx={{
        bgcolor: "background.paper",
        mb: 1,
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Checkbox
        edge="start"
        checked={task.is_completed}
        onChange={() => onToggle(task.id, !task.is_completed)}
        disabled={!isOwner}
      />

      <ListItemText
        primary={
          <Typography
            variant="body1"
            sx={{
              textDecoration: task.is_completed ? "line-through" : "none",
              color: task.is_completed ? "text.disabled" : "text.primary",
            }}
          >
            {task.title}
          </Typography>
        }
        secondary={
          task.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                textDecoration: task.is_completed ? "line-through" : "none",
              }}
            >
              {task.description}
            </Typography>
          )
        }
      />

      {isOwner && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={() => onEdit(task)}
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={() => onDelete(task.id)}
            size="small"
            sx={{ ml: 1 }}
          >
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default TaskItem;
