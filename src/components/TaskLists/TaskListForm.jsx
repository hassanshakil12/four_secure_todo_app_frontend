import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Typography,
} from "@mui/material";

const schema = yup.object().shape({
  title: yup.string().required("Title is required").max(255, "Title too long"),
  description: yup.string().max(1000, "Description too long"),
  is_public: yup.boolean(),
});

const TaskListForm = ({ open, onClose, onSubmit, initialData, loading }) => {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialData || {
      title: "",
      description: "",
      is_public: false,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
    if (!isEdit) {
      reset();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? "Edit Task List" : "Create New Task List"}
      </DialogTitle>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
            margin="normal"
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
            margin="normal"
            disabled={loading}
          />

          <FormControlLabel
            control={<Switch {...register("is_public")} />}
            label="Make this list public"
            sx={{ mt: 2 }}
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              Public lists can be viewed by all users
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TaskListForm;
