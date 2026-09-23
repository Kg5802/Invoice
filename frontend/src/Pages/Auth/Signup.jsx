import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  LinearProgress,
  Avatar,
  Container,
  Divider,
  InputLabel,
  InputAdornment,
  IconButton,
  Link,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    companyName: "",
    address: "",
    city: "",
    zipCode: "",
    industry: "",
    currencySymbol: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signup, isSigningUp } = useAuth();


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG/PNG allowed.");
      return;
    }
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const getStrength = () => {
    const { Password } = formData;
    if (!Password) return 0;
    let s = 0;

    if (Password.length >= 8) s += 25;
    if (/[A-Z]/.test(Password)) s += 25;
    if (/[0-9]/.test(Password)) s += 25;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(Password)) s += 25;

    return s;
  };

  const validate = () => {
    let newErrors = {};
    const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const PasswordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/;

    if (!formData.FirstName.trim())
      newErrors.FirstName = "Please enter your first name.";
    if (!formData.LastName.trim())
      newErrors.LastName = "Please enter your last name.";

    if (!formData.Email) {
      newErrors.Email = "Email is required.";
    } else if (!EmailRegex.test(formData.Email)) {
      newErrors.Email = "Enter a valid Email Address.";
    }


    if (!formData.Password) {
      newErrors.Password = "Password is required.";
    } else if (!PasswordRegex.test(formData.Password)) {
      newErrors.Password = "Password must contain at least eight characters, with one uppercase letter (A-Z), one number (0-9), and one special character (e.g., ! @ # $).";
    }

    if (!formData.CompanyName)
      newErrors.CompanyName = "Please enter your company name.";
    if (!formData.Address.trim())
      newErrors.Address = "Please enter company Address.";
    if (!formData.City) newErrors.City = "Please enter City.";

    if (!/^\d{6}$/.test(formData.ZipCode)) {
      newErrors.ZipCode = "Zip must be exactly 6 digits.";
    }

    if (!formData.CurrencySymbol) {
      newErrors.CurrencySymbol = "Enter a valid currency symbol.";
    } else if (formData.CurrencySymbol.length > 5) {
      newErrors.CurrencySymbol = "Max 5 characters allowed.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const data = {
      firstName: formData.FirstName,
      lastName: formData.LastName,
      email: formData.Email,
      password: formData.Password,
      companyName: formData.CompanyName,
      address: formData.Address,
      city: formData.City,
      zipCode: formData.ZipCode,
      industry: formData.Industry,
      currencySymbol: formData.CurrencySymbol,
    };

    console.log("Signup Data:", data);

    signup(data);

    navigate("/login");
  };

  return (
    <>
      <Container maxWidth="md" sx={{ mb: 5 }}>
        <Box sx={{ textAlign: "center", mb: 4, mt: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 400,
              letterSpacing: 1.5,
              fontSize: "30px",
              mb: 1,
            }}
          >
            Create Your Account
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Set up your company and start invoicing in minutes.
          </Typography>
        </Box>


        <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* User Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="500" fontSize={18}>
                  User Information
                </Typography>
                <Divider sx={{ my: 1 }} />

                <InputLabel
                  sx={{ mt: 2, fontSize: "0.9rem" }}
                  htmlFor="FirstName"
                >
                  First Name*
                </InputLabel>
                <TextField
                  fullWidth
                  name="FirstName"
                  id="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                  margin="dense"
                  size="small"
                  error={!!errors.FirstName}
                  helperText={errors.FirstName}
                  inputProps={{ maxLength: 50 }}
                />

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="LastName">
                  Last Name*
                </InputLabel>
                <TextField
                  fullWidth
                  name="LastName"
                  id="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                  margin="dense"
                  size="small"
                  error={!!errors.LastName}
                  helperText={errors.LastName}
                  inputProps={{ maxLength: 50 }}
                />

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="Email">
                  Email*
                </InputLabel>
                <TextField
                  fullWidth
                  name="Email"
                  id="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Enter your Email"
                  margin="dense"
                  size="small"
                  error={!!errors.Email}
                  helperText={errors.Email}
                />

                <InputLabel sx={{ mt: 2, mb: 1, fontSize: "0.9rem" }} htmlFor="Password">
                  Password*
                </InputLabel>

                <TextField
                  fullWidth
                  name="Password"
                  id="Password"
                  inputProps={{ maxLength: 20 }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  size="small"
                  value={formData.Password}
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
                  error={!!errors.Password}
                  helperText={errors.Password}
                  sx={{ mb: 2 }}
                />

                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={getStrength()}
                    sx={{
                      height: 6,
                      borderRadius: 5,
                    }}
                    color="inherit"
                  />
                  <Typography variant="caption">
                    Password Strength:{" "}
                    {getStrength() <= 25
                      ? "Very Weak"
                      : getStrength() <= 50
                        ? "Weak"
                        : getStrength() <= 75
                          ? "Good"
                          : "Very Strong"}
                  </Typography>
                </Box>
              </Grid>

              {/* Company Information */}
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1" fontWeight="500" fontSize={18}>
                  Company Information
                </Typography>
                <Divider sx={{ my: 1 }} />

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="CompanyName">
                  Company Name*
                </InputLabel>
                <TextField
                  fullWidth
                  name="CompanyName"
                  id="CompanyName"
                  value={formData.CompanyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  margin="dense"
                  size="small"
                  error={!!errors.CompanyName}
                  helperText={errors.CompanyName}
                  inputProps={{ maxLength: 100 }}
                />

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="CompanyLogo">
                  Company Logo
                </InputLabel>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, my: 1 }}
                >
                  <Avatar
                    variant="rounded"
                    src={logoPreview}
                    sx={{ width: 60, height: 60 }}
                  >
                    <CloudUpload />
                  </Avatar>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    color="inherit"
                    sx={{ flexGrow: 1, height: 45 }}
                  >
                    <Box
                      width="100%"
                      textAlign="start"
                      textTransform="none"
                      px={1}
                    >
                      {logoPreview ? "Change Logo" : "No File Chosen"}
                    </Box>
                    <input
                      hidden
                      accept="image/png, image/jpeg"
                      type="file"
                      onChange={handleFile}
                      id="CompanyLogo"
                    />
                  </Button>
                </Box>

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="Address">
                  Address*
                </InputLabel>
                <TextField
                  fullWidth
                  name="Address"
                  id="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  placeholder="Enter company address"
                  margin="dense"
                  size="small"
                  multiline
                  rows={3}
                  error={!!errors.Address}
                  helperText={errors.Address}
                  inputProps={{ maxLength: 500 }}
                />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="City">
                      City*
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="City"
                      id="City"
                      value={formData.City}
                      onChange={handleChange}
                      placeholder="Enter City"
                      margin="dense"
                      size="small"
                      error={!!errors.City}
                      helperText={errors.City}
                      inputProps={{ maxLength: 50 }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="ZipCode">
                      Zip Code*
                    </InputLabel>
                    <TextField
                      fullWidth
                      name="ZipCode"
                      id="ZipCode"
                      value={formData.ZipCode}
                      onChange={handleChange}
                      placeholder="6 digits"
                      margin="dense"
                      size="small"
                      error={!!errors.ZipCode}
                      helperText={errors.ZipCode}
                      inputProps={{ maxLength: 6 }}
                    />
                  </Grid>
                </Grid>

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="Industry">
                  Industry
                </InputLabel>
                <TextField
                  fullWidth
                  name="Industry"
                  id="Industry"
                  value={formData.Industry}
                  onChange={handleChange}
                  placeholder="Industry Type"
                  margin="dense"
                  size="small"
                  inputProps={{ maxLength: 50 }}
                />

                <InputLabel sx={{ mt: 2, fontSize: "0.9rem" }} htmlFor="CurrencySymbol">
                  Currency Symbol*
                </InputLabel>
                <TextField
                  fullWidth
                  name="CurrencySymbol"
                  id="CurrencySymbol"
                  value={formData.CurrencySymbol}
                  onChange={handleChange}
                  placeholder="$, €, AED"
                  margin="dense"
                  size="small"
                  error={!!errors.CurrencySymbol}
                  helperText={errors.CurrencySymbol}
                  inputProps={{ maxLength: 5 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ textAlign: "end", mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  px: 4,
                  py: 1.25,
                  textTransform: "none",
                  bgcolor: "text.primary",
                }}
              >
                Sign Up
              </Button>
            </Box>
            <Box textAlign="center" mt={4}>
              <Typography variant="body2" color="textSecondary">
                Already have an account?{" "}
                <Link
                  sx={{
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                    textDecoration: "none",
                    fontWeight: "550",
                  }}
                  color="textSecondary"
                  onClick={() => navigate("/")}
                >
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Container>

      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isSigningUp}
      >
        <Box textAlign="center">
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Processing your request...</Typography>
        </Box>
      </Backdrop>

    </>
  );
}
