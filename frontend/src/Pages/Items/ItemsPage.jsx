import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  IconButton,
  OutlinedInput,
  Stack,
  InputAdornment,
  Divider,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGridApiRef, DataGrid } from "@mui/x-data-grid";
import { FaColumns, FaDownload } from "react-icons/fa";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { IoArrowBack } from "react-icons/io5";

import { useItems } from "../../hooks/useItems";
import ItemModal from "./ItemModal";
import ItemImage from "../../Component/Item/ItemsImage";
import ConfirmDeleteModal from "../../Component/Common/ConfirmDeleteModal";

const ItemsPage = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [company, setCompany] = useState(null);

  const {
    items,
    isLoading,
    isError,
    addItemAsync,
    updateItemAsync,
    deleteItem,
  } = useItems();

  const apiRef = useGridApiRef();

  useEffect(() => {
    const storedCompany = localStorage.getItem("company");

    if (storedCompany) {
      try {
        setCompany(JSON.parse(storedCompany));
      } catch (error) {
        console.error("Invalid company data:", error);
        setCompany(null);
      }
    }
  }, []);

  const handleOpenAdd = () => {
    setActiveItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setActiveItem(item);
    setModalOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (activeItem) {
        await updateItemAsync({
          ...data,
          itemId: activeItem.itemId,
        });
      } else {
        await addItemAsync(data);
      }

      setModalOpen(false);
      setActiveItem(null);
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  const capitalizeFirst = (text) => {
    if (!text) return "";

    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const handleDeleteClick = (id) => {
    setSelectedItemId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedItemId) return;
    deleteItem(selectedItemId);
    setDeleteModalOpen(false);
    setSelectedItemId(null);
  };

  const columns = [
    {
      field: "picture",
      headerName: "Picture",
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          height="100%"
        >
          <ItemImage itemId={params.row.itemId} />
        </Stack>
      ),
    },

    {
      field: "itemName",
      headerName: "Item Name",
      width: 230,
      renderCell: (params) => (
        <Typography
          fontSize={15}
          fontWeight={500}
          color="primary"
          sx={{
            cursor: "pointer",
            "&:hover": {
              textDecoration: "underline",
            },
          }}
          onClick={() => handleOpenEdit(params.row)}
        >
          {capitalizeFirst(params.row.itemName || "")}
        </Typography>
      ),
    },

    {
      field: "description",
      headerName: "Description",
      width: 450,
      renderCell: (params) => (
        <Typography
          fontSize={15}
          color="text.secondary"
          sx={{
            whiteSpace: "normal",
            lineHeight: 1.5,
          }}
        >
          {params.row.description
            ? capitalizeFirst(params.row.description)
            : "No description"}
        </Typography>
      ),
    },

    {
      field: "salesRate",
      headerName: "Sale Rate",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Typography fontSize={15}>
          {company?.currencySymbol || "$"}
          {Number(params.row.salesRate || 0).toFixed(2)}
        </Typography>
      ),
    },

    {
      field: "discountPct",
      headerName: "Discount %",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <Typography fontSize={15}>
          {Number(params.row.discountPct || 0).toFixed(2)}%
        </Typography>
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      width: 140,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleOpenEdit(params.row)}
          >
            <EditSquareIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            color="error"
            onClick={() =>
              handleDeleteClick(params.row.itemId)
            }
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const filteredItems = items.filter((item) =>
    `${item.itemName || ""} ${item.description || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: "95%", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          m: 3,
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 400,
              mb: 0.75,
              fontSize: "30px",
            }}
          >
            Items
          </Typography>

          <Typography
            variant="body2"
            sx={{
              fontSize: 16,
              color: "text.secondary",
            }}
          >
            Manage your product and service catalog.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<IoArrowBack />}
          onClick={() => navigate("/invoices")}
          sx={{
            bgcolor: "#1976d2",
            color: "#fff",
            textTransform: "capitalize",
            "&:hover": {
              bgcolor: "#1565c0",
            },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Divider />

      {/* Search + Actions */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{
          justifyContent: "space-between",
          my: 2,
        }}
      >
        <OutlinedInput
          name="search"
          type="text"
          placeholder="Search items..."
          sx={{
            height: "40px",
            mr: "10px",
            flex: 0.5,
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          }
        />

        <Box>
          {/* Add Item */}
          <Button
            variant="contained"
            sx={{
              mr: 1,
              textTransform: "capitalize",
              bgcolor: "text.primary",
              py: 1,
              mb: 1,
            }}
            onClick={handleOpenAdd}
          >
            <AddIcon sx={{ mr: 1 }} />
            Add New Item
          </Button>

          {/* Export */}
          <Button
            variant="outlined"
            sx={{
              mr: 1,
              textTransform: "capitalize",
              borderColor: "text.primary",
              color: "text.primary",
              py: 0.9,
              mb: 1,
            }}
            onClick={() =>
              apiRef.current.exportDataAsCsv({
                fileName: "items-data",
                fields: [
                  "itemName",
                  "description",
                  "salesRate",
                  "discountPct",
                ],
              })
            }
          >
            <FaDownload
              style={{ marginRight: "10px" }}
              fontSize={16}
            />
            Export
          </Button>

          {/* Columns */}
          <Button
            variant="outlined"
            sx={{
              mr: 1,
              textTransform: "capitalize",
              borderColor: "text.primary",
              color: "text.primary",
              py: 1.2,
              mb: 1,
              minWidth: "50px",
            }}
            onClick={() =>
              apiRef.current.showPreferences("columns")
            }
          >
            <FaColumns fontSize={20} />
          </Button>
        </Box>
      </Stack>

      <Divider />

      {/* DataGrid */}
      <Card sx={{ mt: 2 }}>
        <Paper
          sx={{
            height: 370,
            width: "100%",
          }}
        >
          <DataGrid
            apiRef={apiRef}
            rows={filteredItems}
            getRowId={(row) => row.itemId}
            columns={columns}
            loading={isLoading}
            getRowHeight={() => "auto"}
            hideFooter
            sx={{
              border: 0,
              px: 2,

              "& .MuiDataGrid-cell": {
                p: 2,
              },

              "& .actions": {
                paddingRight: "25px !important",
              },
            }}
          />
        </Paper>
      </Card>

      {/* Item Modal */}
      <ItemModal
        open={modalOpen}
        handleClose={() => {
          setModalOpen(false);
          setActiveItem(null);
        }}
        onSave={handleSave}
        activeItem={activeItem}
      />

      {/* Delete Modal */}
      <ConfirmDeleteModal
        open={deleteModalOpen}
        handleClose={() => {
          setDeleteModalOpen(false);
          setSelectedItemId(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This will remove it from your catalog permanently."
      />
    </Box>
  );
};

export default ItemsPage;