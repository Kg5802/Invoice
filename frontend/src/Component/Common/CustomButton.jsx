import Button from "@mui/material/Button";

const CustomButton = ({
  children,
  onClick,
  variant = "contained",
  active = false,
  sx = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      sx={{
        borderRadius: "50px",
        textTransform: "none",
        fontSize: "14px",
        fontWeight: active ? 500 : 400,
        px: 2,
        py: 0.5,
        minWidth: "90px",
        bgcolor: active ? "#1A1A1A" : "#F1F3F5",
        color: active ? "#FFFFFF" : "#495057",
        boxShadow: "none",
        "&:hover": {
          bgcolor: active ? "#000000" : "#E9ECEF",
          boxShadow: "none",
        },
        ...sx, // ✅ allows overrides from parent
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
