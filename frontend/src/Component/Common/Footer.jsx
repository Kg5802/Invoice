import { Box, Typography, Divider, Link } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        bgcolor: "#fff",
        borderTop: "1px solid #e0e0e0",
        py: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, fontSize: 13 }}
        >
          © 2026 InvoiceApp. All rights reserved.
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="#"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: 13 }}
          >
            Privacy Policy
          </Link>

          <Link
            href="#"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: 13 }}
          >
            Terms of Service
          </Link>

          <Link
            href="#"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: 13 }}
          >
            Support
          </Link>
        </Box>
      </Box>
    </Box>
  );
}

export default Footer;