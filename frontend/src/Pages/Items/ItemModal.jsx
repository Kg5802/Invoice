import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Avatar,
  Typography,
  Grid,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useItems } from "../../hooks/useItems";
import api from "../../api/axios";
import toast from "react-hot-toast";

const ItemModal = ({ open, handleClose, onSave, activeItem }) => {
  const [formData, setFormData] = useState({
    itemName: "",
    description: "",
    salesRate: 0,
    discountPct: 0,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const { addItemAsync, updateItem, updatePictureAsync } = useItems();

  const fetchExistingImage = async (id) => {
    try {
      if (!id) {
        setLogoPreview(null);
        return;
      }

      const response = await api.get(
        `/Item/${id}/picture`,
        {
          responseType: "blob",
        }
      );

      if (response.data && response.data.size > 0) {
        const imageUrl = URL.createObjectURL(response.data);

        setLogoPreview(imageUrl);
      } else {
        setLogoPreview(null);
      }
    } catch (error) {
      console.error(
        "Error fetching existing image:",
        error
      );

      setLogoPreview(null);
    }
  };


  useEffect(() => {
    setLogoPreview(null);
    setLogoFile(null);
    setErrors({});
    setIsSaving(false);

    if (activeItem) {
      setFormData({
        itemName: activeItem.itemName || "",
        description: activeItem.description || "",
        salesRate: activeItem.salesRate || 0,
        discountPct: activeItem.discountPct || 0,
      });
      fetchExistingImage(activeItem.itemId);
    } else {
      setFormData({
        itemName: "",
        description: "",
        salesRate: "",
        discountPct: "",
      });
      setLogoPreview(null);
      setLogoFile(null);
    }
    setErrors({});
  }, [activeItem, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.itemName.trim())
      tempErrors.itemName = "Item Name is required.";
    if (formData.itemName.length > 50)
      tempErrors.itemName = "Max 50 characters allowed.";
    if (formData.salesRate < 0)
      tempErrors.salesRate = "Sale Rate cannot be negative.";
    if (formData.discountPct < 0 || formData.discountPct > 100) {
      tempErrors.discountPct = "Discount must be between 0 and 100%.";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const isInvalidType = ![
      "image/jpeg",
      "image/png",
    ].includes(file.type);

    const isTooLarge = file.size > 5 * 1024 * 1024;

    if (isInvalidType) {
      toast.error("Only PNG/JPG allowed.");
      return;
    }

    if (isTooLarge) {
      toast.error("Max size is 5MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);

    const payload = {
      itemName: formData.itemName,
      description: formData.description,
      salesRate: parseFloat(formData.salesRate || 0),
      discountPct: parseFloat(formData.discountPct || 0),
    };

    try {
      if (activeItem) {

        await updateItem({
          ...payload,
          itemId: activeItem.itemId,
        });

        // Upload image separately
        if (logoFile) {
          await updatePictureAsync({
            itemId: activeItem.itemId,
            file: logoFile,
          });
        }

      } else {

        const response = await addItemAsync(payload);

        const newItemId =
          response?.item?.itemId ??
          response?.data?.item?.itemId ??
          response?.itemId;

       

        // Upload image separately
        if (logoFile && newItemId) {
          await updatePictureAsync({
            itemId: newItemId,
            file: logoFile,
          });
        }

  
      }

      handleClose();
    } catch (err) {
      console.error("Save failed:", err);

      toast.error(
        err.response?.data?.message ||
        "Failed to save item."
      );
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          overflowX: "hidden",
          borderRadius: 2,
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "1.25rem",
          fontWeight: 600,
          py: 2,
        }}
      >
        {activeItem ? "Edit Item" : "New Item"}

        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        dividers
        sx={{
          overflowX: "hidden",
          maxWidth: "100%",
        }}
      >
        {/* Item Picture */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body2"
            gutterBottom
            sx={{ color: "text.secondary" }}
          >
            Item Picture
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              variant="rounded"
              src={logoPreview || undefined}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#f5f5f5",
                border: "1px solid #ddd",
              }}
            >
              <CloudUploadIcon
                sx={{
                  color: "#aaa",
                  fontSize: 32,
                }}
              />
            </Avatar>

            <Box>
              <Button
                variant="outlined"
                component="label"
                size="small"
                sx={{
                  textTransform: "none",
                  color: "black",
                  borderColor: "#ccc",
                }}
              >
                {logoPreview ? "Change File" : "Choose File"}

                <input
                  hidden
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                />
              </Button>

              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  color: "text.secondary",
                }}
              >
                PNG or JPG (Max 5MB)
              </Typography>

              {logoFile && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    color: "text.primary",
                  }}
                >
                  {logoFile.name}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Item Name */}
        <Typography
          variant="body2"
          sx={{
            mb: 0.5,
            fontWeight: 500,
          }}
        >
          Item Name *
        </Typography>

        <TextField
          fullWidth
          name="itemName"
          value={formData.itemName}
          onChange={handleChange}
          placeholder="Enter item name"
          size="small"
          sx={{ mb: 3 }}
          error={!!errors.itemName}
          helperText={errors.itemName}
        />

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            mb: 0.5,
            fontWeight: 500,
          }}
        >
          Description
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter item description"
          inputProps={{
            maxLength: 500,
          }}
        />

        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "right",
            color: "text.secondary",
            mb: 3,
          }}
        >
          {formData.description.length}/500
        </Typography>

        {/* Sale Rate & Discount */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Sale Rate *
            </Typography>

            <TextField
              fullWidth
              size="small"
              type="number"
              name="salesRate"
              value={formData.salesRate}
              onChange={handleChange}
              placeholder="0.00"
              error={!!errors.salesRate}
              helperText={errors.salesRate}
              inputProps={{
                min: 0,
                style: {
                  textAlign: "right",
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              Discount (%)
            </Typography>

            <TextField
              fullWidth
              size="small"
              type="number"
              name="discountPct"
              value={formData.discountPct}
              onChange={handleChange}
              placeholder="0"
              error={!!errors.discountPct}
              helperText={errors.discountPct}
              inputProps={{
                min: 0,
                max: 100,
                style: {
                  textAlign: "right",
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    %
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* Dialog Footer */}
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            textTransform: "none",
            color: "text.primary",
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSaving}
          sx={{
            bgcolor: "#444",
            "&:hover": {
              bgcolor: "#222",
            },
            textTransform: "none",
            minWidth: 100,
          }}
        >
          {isSaving ? (
            <CircularProgress
              size={22}
              color="inherit"
            />
          ) : (
            "Save"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ItemModal;
