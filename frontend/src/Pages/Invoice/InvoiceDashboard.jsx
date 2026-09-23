import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Stack,
  OutlinedInput,
  InputAdornment,
  Divider,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import { Menu, MenuItem } from "@mui/material";

import { DataGrid, useGridApiRef } from "@mui/x-data-grid";
import { LineChart } from "@mui/x-charts/LineChart";
import { PieChart } from "@mui/x-charts/PieChart";

import { format, subDays } from "date-fns";
import { Search, Add, Edit, Delete, Print } from "@mui/icons-material";
import { FaColumns, FaDownload } from "react-icons/fa";

import { useInvoices, useInvoiceChart } from "../../hooks/useInvoices";
import { useNavigate } from "react-router-dom";
import { printInvoice } from "../../util/printInvoice";

import ConfirmDeleteModal from "../../Component/Common/ConfirmDeleteModal";
import toast from "react-hot-toast";
import CustomButton from "../../Component/Common/CustomButton";

const Invoices = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Today");
  const [openCustomDialog, setOpenCustomDialog] = useState(false);
  const [customDates, setCustomDates] = useState({ from: null, to: null });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [company, setCompany] = useState(null);
  const apiRef = useGridApiRef();

  const dateParams = useMemo(() => {
    const today = new Date();
    let from;
    let to = null;

    switch (activeFilter) {
      case "Today":
        from = format(today, "yyyy-MM-dd");
        break;
      case "Week":
        from = format(subDays(today, 7), "yyyy-MM-dd");
        break;
      case "Month":
        from = format(subDays(today, 30), "yyyy-MM-dd");
        break;
      case "Year":
        from = format(subDays(today, 365), "yyyy-MM-dd");
        break;
      case "Custom":
        from = customDates.from;
        to = customDates.to;
        break;
      default:
        from = format(subDays(today, 30), "yyyy-MM-dd");
    }
    return { from, to };
  }, [activeFilter, customDates]);

  const {
    invoices,
    isLoading,
    invoiceMetrics,
    isLoadingMetrics,
    deleteInvoice,
    topItems,
    isLoadingTopItems,
  } = useInvoices(dateParams.from, dateParams.to);

  const { data } = useInvoiceChart();

  const chartData = data.map((item) => {
    const date = new Date(item.monthStart);

    return {
      month: date.toLocaleString("default", { month: "short" }),
      amount: item.amountSum,
      invoices: item.invoiceCount,
    };
  });


  const pieData = useMemo(() => {
    return topItems
      .slice(0, 5)
      .map((item, index) => ({
        id: item.itemID,
        value: Number(item.amountSum) || 0,
        label: item.itemName || "Unknown",
        color: [
          "#4c5cff",
          "#ffad1f",
          "#ff4d5a",
          "#18afe3",
          "#8e5cff",
        ][index],
      }))
      .filter((item) => item.value > 0);
  }, [topItems]);


  useEffect(() => {
    const storedCompany = localStorage.getItem("company");
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany));
    } else {
      setCompany(null);
    }
  }, []);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = (id) => {
    setSelectedInvoiceId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    console.log(selectedInvoiceId);
    deleteInvoice(selectedInvoiceId);
    setDeleteModalOpen(false);
    setSelectedInvoiceId(null);
  };

  const columns = [
    {
      field: "invoiceNo",
      headerName: "Invoice No",
      flex: 0.75,
      minWidth: 100,
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: "primary.main",
            fontSize: 14,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() =>
            navigate("/invoices/form", {
              state: { activeInvoice: params.row },
            })
          }
        >
          {params?.row?.invoiceNo}
        </Typography>
      ),
    },
    {
      field: "invoiceDate",
      headerName: "Date",
      flex: 0.75,
      minWidth: 120,
      valueFormatter: (value) =>
        value ? format(new Date(value), "dd-MMM-yyyy") : "",
    },
    { field: "customerName", headerName: "Customer", flex: 1, minWidth: 180 },
    {
      field: "totalItems",
      headerName: "Items",
      type: "number",
      minWidth: 100,
      renderCell: (params) =>
        params.value?.toLocaleString() ?? "0",
    },
    {
      field: "subTotal",
      headerName: "Sub Total",
      width: 150,
      minWidth: 150,
      type: "number",
      valueFormatter: (value) => `${company?.currencySymbol || "$"}${value.toLocaleString()}`,
    },
    {
      field: "taxPercentage",
      headerName: "Tax %",
      minWidth: 150,
      type: "number",
      valueFormatter: (value) => `${value}%`,
    },
    {
      field: "taxAmount",
      headerName: "Tax Amt",
      minWidth: 150,
      type: "number",
      valueFormatter: (value) => `${company?.currencySymbol || "$"}${value}`,
    },
    {
      field: "invoiceAmount",
      headerName: "Total",
      minWidth: 150,
      type: "number",
      renderCell: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "100%",
          }}
        >
          {company?.currencySymbol || "$"}{params?.value?.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      exportable: false,
      hideable: false,
      headerAlign: "right",
      align: "right",
      disableReorder: true,
      flex: 1,
      width: 130,
      headerClassName: "actions",
      renderCell: (params) => (
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "flex-end",
            height: "100%",
            gap: 0.5,
          }}
        >
          <IconButton
            size="small"
            sx={{
              color: "#2563EB",
              "&:hover": {
                color: "#1D4ED8",
                bgcolor: "#DBEAFE",
              },
            }}
            onClick={() =>
              navigate("/invoices/form", {
                state: { activeInvoice: params.row },
              })
            }
          >
            <Edit sx={{ color: "#1976d2 !important" }} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: "#16A34A",
              "&:hover": {
                color: "#15803D",
                bgcolor: "#DCFCE7",
              },
            }}
            onClick={async () => {
              try {
                await printInvoice(params.row.invoiceID);
              } catch (e) {
                toast.error("Failed to generate print view");
              }
            }}
          >
            <Print sx={{ color: "#2E7D32 !important" }} />
          </IconButton>

          <IconButton
            size="small"
            sx={{
              color: "#DC2626  !important",
              "&:hover": {
                color: "#B91C1C",
                bgcolor: "#FEE2E2",
              },
            }}
            onClick={() => handleDeleteClick(params.row.invoiceID)}
          >
            <Delete sx={{ color: "#D32F2F !important" }} />
          </IconButton>
        </Stack>
      ),
    },
  ];


  const filteredRows = invoices.filter((row) => {
    const searchTerm = search.toLowerCase();
    return (
      row.invoiceNo?.toLowerCase().includes(searchTerm) ||
      row.customerName?.toLowerCase().includes(searchTerm)
    );
  });

  return (
    <Box sx={{ width: "95%", mx: "auto" }}>
      {/* ... header, metrics, search/actions, DataGrid ... */}
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          m: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
          Invoices
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {/* Quick filters */}
          {["Today", "Week", "Month", "Year"].map((label) => (
            <CustomButton
              key={label}
              active={activeFilter === label}
              onClick={() => setActiveFilter(label)}
            >
              {label}
            </CustomButton>
          ))}

          {/* ✅ Custom button with dropdown */}
          <CustomButton
            active={activeFilter === "Custom"}
            onClick={handleOpenMenu}
          >
            Custom
          </CustomButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
          >
            <MenuItem disableRipple>
              <TextField
                label="From"
                type="date"
                value={customDates.from ?? ""}
                onChange={(e) =>
                  setCustomDates((prev) => ({
                    ...prev,
                    from: e.target.value,
                    to: prev.to || e.target.value, // ✅ auto-fill To if empty
                  }))
                }
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </MenuItem>
            <MenuItem disableRipple>
              <TextField
                label="To"
                type="date"
                value={customDates.to ?? ""}
                onChange={(e) =>
                  setCustomDates((prev) => ({ ...prev, to: e.target.value }))
                }
                InputLabelProps={{ shrink: true }}
                size="small"
                inputProps={{
                  min: customDates.from || undefined, // ✅ prevent To < From
                }}
              />
            </MenuItem>
            <MenuItem disableRipple>
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  bgcolor: "#000000", // ✅ black Apply button
                  color: "#FFFFFF",
                  "&:hover": { bgcolor: "#333" },
                }}
                disabled={!customDates.from || !customDates.to} // ✅ disable until both selected
                onClick={() => {
                  setActiveFilter("Custom");
                  handleCloseMenu();
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                sx={{
                  ml: 1,
                  textTransform: "none",
                  color: "#000000",
                  borderColor: "#000000",
                  "&:hover": { bgcolor: "#f5f5f5" },
                }}
                onClick={handleCloseMenu}
              >
                Cancel
              </Button>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>



      {/* ✅ Grid untouched as requested */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }} flexWrap="wrap">
          <Card variant="outlined" sx={{ p: 2, height: "185px" }}>
            <Typography variant="h4" sx={{ fontWeight: 500 }}>
              {isLoadingMetrics ? "..." : invoiceMetrics?.invoiceCount}
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>Number of Invoices</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {activeFilter}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ p: 2, height: "185px" }}>
            <Typography variant="h4" sx={{ fontWeight: 500 }}>
              {isLoadingMetrics
                ? "..."
                : `${company?.currencySymbol || "$"}${invoiceMetrics?.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </Typography>
            <Typography sx={{ color: "text.secondary" }}>Total Invoice Amount</Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {activeFilter}
            </Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ py: 2, px: 3, height: "185px", bgcolor: "#f9f9f9" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 2 }}>
              Last 12 Months
            </Typography>
            <Card variant="outlined" sx={{ height: "75%", bgcolor: "#eee", border: "none" }}>
              <LineChart
                height={100}
                series={[
                  {
                    data: chartData.map((item) => item.amount),
                    label: "Revenue",

                    valueFormatter: (value) =>
                      `${company?.currencySymbol || "$"}${Number(value || 0).toFixed(2)}`,
                  },
                ]}
                xAxis={[
                  {
                    scaleType: "point",
                    data: chartData.map((item) => item.month),
                  },
                ]}
              />
            </Card>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ py: 2, px: 3, height: "185px", bgcolor: "#f9f9f9" }}>
            <Typography sx={{ color: "text.secondary", fontSize: 13, mb: 2 }}>
              Top 5 Items
            </Typography>
            <Box
              sx={{
                height: "85%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isLoadingTopItems ? (
                <Typography variant="caption">Loading...</Typography>
              ) : pieData.length > 0 ? (
                <PieChart
                  width={120}
                  height={120}
                  margin={{ top: 0, bottom: 30, left: 0, right: 35 }}
                  series={[
                    {
                      data: pieData,
                      innerRadius: 20,
                      outerRadius: 40,
                      paddingAngle: 2,
                      cornerRadius: 3,
                    },
                  ]}
                  slotProps={{ legend: { hidden: true } }}
                />
              ) : (
                <Typography variant="caption" sx={{ color: "text.disabled" }}>
                  No data available
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Search + Actions */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", flexWrap: "wrap", mb: 2, gap: 2 }}
      >
        <OutlinedInput
          size="small"
          placeholder="Search Invoice No, Customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 350, bgcolor: "white" }}
          startAdornment={
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          }
        />

        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
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
            size="medium"
            onClick={() => navigate("/items")}
          >
            All Items
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{
              bgcolor: "black",
              "&:hover": { bgcolor: "#333" },
              mr: 1,
              textTransform: "capitalize",
              py: 0.9,
              mb: 1,
            }}
            onClick={() =>
              navigate("/invoices/form", { state: { activeInvoice: null } })
            }
          >
            New Invoice
          </Button>

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
            size="medium"
            onClick={() =>
              apiRef.current.exportDataAsCsv({
                fileName: "invoices-data",
                fields: [
                  "invoiceNo",
                  "invoiceDate",
                  "customerName",
                  "totalItems",
                  "subTotal",
                  "taxPercentage",
                  "taxAmount",
                  "invoiceAmount",
                ],
              })
            }
          >
            <FaDownload style={{ marginRight: "10px" }} fontSize={16} />
            Export
          </Button>

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
            size="medium"
            onClick={() => apiRef.current.showPreferences("columns")}
          >
            <FaColumns fontSize={20} />
          </Button>
        </Box>
      </Stack>

      {/* DataGrid */}
      <Paper sx={{ height: 260 }}>
        <DataGrid
          apiRef={apiRef}
          rows={filteredRows}
          getRowId={(row) => row.primaryKeyID}
          columns={columns}
          getRowHeight={() => "auto"}
          hideFooter
          sx={{
            border: 0,
            px: 2,

            "& .MuiDataGrid-cell": {
              p: 1.2,
            },

            "& .actions": {
              paddingRight: "25px !important",
            },

            /* Header */
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
              fontWeight: "bold",
            },

            /* Header text */
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 600,
              color: "#000",
            },

            /* All DataGrid icons */
            "& .MuiDataGrid-iconButton": {
              color: "#000",
            },

            "& .MuiDataGrid-sortIcon": {
              color: "#000",
            },

            "& .MuiDataGrid-menuIcon": {
              color: "#000",
            },

            "& .MuiDataGrid-columnSeparator": {
              color: "#000",
            },

            "& .MuiSvgIcon-root": {
              color: "#000",
            },
          }}
        />
      </Paper>


      {/* ✅ Custom Date Dialog */}
      <Dialog open={openCustomDialog} onClose={() => setOpenCustomDialog(false)}>
        <DialogTitle>Select Custom Date Range</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="From"
              type="date"
              value={customDates.from ?? ""}   // ✅ stays empty until user selects
              onChange={(e) =>
                setCustomDates((prev) => ({ ...prev, from: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="To"
              type="date"
              value={customDates.to ?? ""}     // ✅ stays empty until user selects
              onChange={(e) =>
                setCustomDates((prev) => ({ ...prev, to: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setActiveFilter("Custom");
              setOpenCustomDialog(false);
            }}
            variant="contained"
            sx={{
              textTransform: "none",
              bgcolor: "#000000",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#333" },
            }}
          >
            Apply
          </Button>
          <Button
            onClick={() => setOpenCustomDialog(false)}
            variant="outlined"
            sx={{
              textTransform: "none",
              color: "#000000",
              borderColor: "#000000",
              "&:hover": { bgcolor: "#f5f5f5" },
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This will remove it from your catalog permanently."
      />

    </Box>
  );

};

export default Invoices;
