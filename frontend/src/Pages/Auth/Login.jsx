import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  InputLabel,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  InputAdornment,
  IconButton,
  Link,
  Backdrop,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const isFormInvalid = !validateEmail(formData.email);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <Box
      sx={{
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Container maxWidth="sm" sx={{ my: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 400, letterSpacing: 1, fontSize: "30px", mb: 1 }}
          >
            Welcome Back
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: "16px" }}>
            Log in to your account.
          </Typography>
        </Box>

        {/* Card */}
        <Paper
          variant="outlined"
          sx={{ p: 5, borderRadius: 2, bgcolor: "background.paper" }}
        >
          <form onSubmit={handleSubmit}>
            {/* Email */}
            <InputLabel
              sx={{
                mb: 1,
                fontSize: "0.9rem",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              Email Address*
            </InputLabel>
            <TextField
              fullWidth
              name="email"
              placeholder="Enter your email"
              size="small"
              value={formData.email}
              onChange={handleChange}
              error={formData.email !== "" && !validateEmail(formData.email)}
              helperText={
                formData.email !== "" && !validateEmail(formData.email)
                  ? "Enter a valid email."
                  : ""
              }
              sx={{ mb: 3 }}
            />

            {/* Password */}
            <InputLabel
              sx={{
                mb: 1,
                fontSize: "0.9rem",
                color: "text.primary",
                fontWeight: 500,
              }}
            >
              Password*
            </InputLabel>
            <TextField
              fullWidth
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              size="small"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            {/* Remember Me */}
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  onChange={handleChange}
                  size="small"
                />
              }
              label={<Typography variant="body2">Remember me</Typography>}
              sx={{ mb: 3, color: "text.secondary" }}
            />

            {/* Submit */}
            <Box sx={{ textAlign: "right", mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isFormInvalid || isLoggingIn}
                sx={{
                  bgcolor: "grey.700",
                  px: 4,
                  py: 1,
                  textTransform: "none",
                  fontSize: "16px",
                  minWidth: "100px",
                  "&:hover": { bgcolor: "grey.900" },
                }}
              >
                {isLoggingIn ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </Box>

            {/* Signup Link */}
            <Box sx={{ textAlign: "center", mt: 5 }}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Don't have an account?{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                    textDecoration: "none",
                    fontWeight: 550,
                    "&:hover": { textDecoration: "underline" },
                  }}
                  color="text.secondary"
                  onClick={() => navigate("/signup")}
                >
                  Create account
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>

      {/* Backdrop */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isLoggingIn}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Processing your request...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
}
