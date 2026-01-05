import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  username: yup.string().required("Username is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Password confirmation is required"),
});

const Register = () => {
  const { register: registerUser, error, loading } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setFormError({});
    const result = await registerUser(data);
    if (result.success) {
      navigate("/dashboard");
    } else if (result.errors) {
      setFormError(result.errors);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Register
          </Typography>

          {error && typeof error === "string" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Name"
              {...register("name")}
              error={!!errors.name || !!formError.name}
              helperText={errors.name?.message || formError.name?.[0]}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Username"
              {...register("username")}
              error={!!errors.username || !!formError.username}
              helperText={errors.username?.message || formError.username?.[0]}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              {...register("email")}
              error={!!errors.email || !!formError.email}
              helperText={errors.email?.message || formError.email?.[0]}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              {...register("password")}
              error={!!errors.password || !!formError.password}
              helperText={errors.password?.message || formError.password?.[0]}
              margin="normal"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              {...register("password_confirmation")}
              error={!!errors.password_confirmation}
              helperText={errors.password_confirmation?.message}
              margin="normal"
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Register"}
            </Button>

            <Box textAlign="center">
              <Link component={RouterLink} to="/login" variant="body2">
                Already have an account? Login
              </Link>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
