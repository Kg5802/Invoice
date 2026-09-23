import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const ConfirmDeleteModal = ({ open, handleClose, onConfirm, title, message }) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
        <Box
          sx={{
            bgcolor: "#ffebee",
            color: "#d32f2f",
            width: 60,
            height: 60,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <DeleteOutlineIcon
            sx={{
              fontSize: 32,
              color: "#d32f2f",
            }}
          />
        </Box>
        <Typography fontWeight="600">
          {title || "Confirm Delete"}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography color="text.secondary">
          {message ||
            "Are you sure you want to delete this item? This action cannot be undone."}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", pb: 3, px: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          fullWidth
          sx={{ textTransform: "none", color: "black", borderColor: "#ccc" }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          fullWidth
          color="error"
          sx={{ textTransform: "none", bgcolor: "#d32f2f" }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
