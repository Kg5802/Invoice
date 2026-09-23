import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  Grid,
  Card,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useInvoices } from "../../hooks/useInvoices";
import { useItems } from "../../hooks/useItems";
import api from "../../api/axios";
import toast from "react-hot-toast";
import ItemSelect from "../../Component/Item/ItemsSelect";

const createRowId = () =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const defaultRow = () => ({
  id: createRowId(),
  itemObject: null,
  description: "",
  qty: 1,
  rate: 0,
  discountPct: 0,
  amount: 0,
});

const InvoiceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeInvoice = location.state?.activeInvoice || null;
  const isEdit = !!activeInvoice;

  const { addInvoice, updateInvoice, invoices } = useInvoices();

  const [invoiceDetails, setInvoiceDetails] = useState({
    invoiceID: 0,
    primaryKeyID: 0,
    invoiceNo: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    customerName: "",
    city: "",
    address: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState([defaultRow()]);
  const [taxPct, setTaxPct] = useState(0);
  const [taxAmt, setTaxAmt] = useState(0);

  const [company, setCompany] = useState(null);

  const { items } = useItems();

  useEffect(() => {
    const storedCompany = localStorage.getItem("company");
    if (storedCompany) {
      setCompany(JSON.parse(storedCompany));
    } else {
      setCompany(null);
    }
  }, []);

  useEffect(() => {
    const fetchFullInvoice = async () => {
      if (!isEdit || !activeInvoice || !items?.length) {
        return;
      }

      try {
        const response = await api.get(
          `/Invoice/${activeInvoice.invoiceID}`
        );

        const data = response.data.invoice;

        setInvoiceDetails({
          primaryKeyID: data.primaryKeyID,
          invoiceID: data.invoiceID,
          invoiceNo: String(data.invoiceNo || ""),
          invoiceDate: data.invoiceDate
            ? data.invoiceDate.split("T")[0]
            : "",
          customerName: data.customerName || "",
          address: data.address || "",
          city: data.city || "",
          notes: data.notes || "",
        });

        setTaxPct(Number(data.taxPercentage) || 0);

        if (data.items && data.items.length > 0) {
          const mappedRows = data.items.map((item, index) => {
            const masterItem = items.find(
              (it) =>
                Number(it.itemId) === Number(item.itemId)
            );

            return {
              id: `${item.itemId}-${index}`,
              itemObject: masterItem || {
                itemId: item.itemId,
                itemName: item.itemName || "",
              },

              itemId: item.itemId,

              description: item.description || "",

              qty: Number(item.quantity) || 1,

              rate: Number(item.salesRate) || 0,

              discountPct: Number(item.discountPct) || 0,

              amount: Number(item.amount) || 0,
            };
          });

          setLineItems(mappedRows);
        } else {
          setLineItems([]);
        }

      } catch (error) {
        console.error(
          "Error fetching full invoice:",
          error
        );
      }
    };

    fetchFullInvoice();
  }, [isEdit, activeInvoice, items]);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setInvoiceDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (id, field, value) => {
    setLineItems((prevRows) =>
      prevRows.map((row) => {
        if (row.id !== id) {
          return row;
        }

        const updatedRow = {
          ...row,
          [field]: value,
        };

        if (field === "itemObject") {
          const selectedItem = value;

          updatedRow.itemObject = selectedItem;
          updatedRow.description =
            selectedItem?.description ||
            selectedItem?.itemName ||
            selectedItem?.name ||
            "";

          updatedRow.rate = Number(selectedItem?.salesRate) || 0;
          updatedRow.discountPct = Number(selectedItem?.discountPct) || 0;
        }

        const qty = Number(updatedRow.qty) || 0;
        const rate = Number(updatedRow.rate) || 0;
        const discountPct = Number(updatedRow.discountPct) || 0;

        const grossAmount = qty * rate;
        const discountAmount = grossAmount * (discountPct / 100);

        updatedRow.amount = Number(
          Math.max(0, grossAmount - discountAmount).toFixed(2)
        );

        return updatedRow;
      })
    );
  };

  const addRow = () => {
    setLineItems((prev) => [...prev, defaultRow()]);
  };

  const deleteRow = (id) => {
    setLineItems((prev) => prev.filter((row) => row.id !== id));
  };

  const copyRow = (rowToCopy) => {
    const newRow = {
      ...rowToCopy,
      id: createRowId(),
    };

    setLineItems((prev) => [...prev, newRow]);
  };

  const invoiceTotals = useMemo(() => {
    const subTotal = lineItems.reduce(
      (sum, row) => sum + (Number(row.amount) || 0),
      0
    );

    const currentTaxPct = Number(taxPct) || 0;

    const calculatedTaxAmt = subTotal * (currentTaxPct / 100);

    const finalAmount = subTotal + calculatedTaxAmt;

    return {
      subTotal: Number(subTotal.toFixed(2)),
      taxAmt: Number(calculatedTaxAmt.toFixed(2)),
      invoiceAmount: Number(finalAmount.toFixed(2)),
    };
  }, [lineItems, taxPct]);

  const handleSubmit = async () => {
    if (!invoiceDetails.customerName.trim()) {
      toast.error("Customer Name is required");
      return;
    }

    const validLines = lineItems.filter(
      (line) => line.itemObject?.itemId
    );

    if (validLines.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    const formattedLines = validLines.map((line, index) => ({
      rowNo: index + 1,
      itemId: line.itemObject.itemId,
      description: line.description || "",
      quantity: Number(line.qty) || 0,
      rate: Number(line.rate) || 0,
      discountPct: Number(line.discountPct) || 0,
    }));

    const finalPayload = {
      invoiceNo: Number(invoiceDetails.invoiceNo) || 0,
      invoiceDate: invoiceDetails.invoiceDate,
      customerName: invoiceDetails.customerName.trim(),
      address: invoiceDetails.address?.trim() || "",
      city: invoiceDetails.city?.trim() || null,
      taxPercentage: Number(taxPct) || 0,
      notes: invoiceDetails.notes?.trim() || "",
      subTotal: invoiceTotals.subTotal,
      taxAmount: invoiceTotals.taxAmt,
      invoiceAmount: invoiceTotals.invoiceAmount,
      items: formattedLines,
    };

    if (isEdit) {
      finalPayload.invoiceID = activeInvoice.invoiceID;
      finalPayload.updatedOn = activeInvoice.updatedOn;
    }

    try {
      if (isEdit) {
        await updateInvoice(finalPayload);

      } else {
        await addInvoice(finalPayload);
      }

      navigate("/invoices");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error(
        error?.response?.data?.message || "Error while saving invoice."
      );
    }
  };

  const cancelForm = () => navigate(-1);

  const textProps = {
    size: "small",
    fullWidth: true,
    sx: { bgcolor: "white" },
  };

  return (
    <Box sx={{ width: "96%", mx: "auto", py: 2 }}>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          variant="h5"
          sx={{ fontWeight: 500 }}
        >
          {isEdit ? "Edit Invoice" : "New Invoice"}
        </Typography>


      </Stack>


      <Stack spacing={3}>
        <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
          <Typography
            variant="h6"
            sx={{ color: "text.secondary", fontWeight: 400, mb: 3 }}
          >
            Invoice Details
          </Typography>

          <Grid container spacing={4} rowSpacing={3}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Invoice No
              </Typography>
              <TextField
                {...textProps}
                name="invoiceNo"
                value={invoiceDetails.invoiceNo}
                onChange={handleDetailChange}
                placeholder="INV-001"
                InputProps={{ readOnly: true }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Auto next available number
              </Typography>
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Invoice Date *
              </Typography>
              <TextField
                {...textProps}
                type="date"
                name="invoiceDate"
                value={invoiceDetails.invoiceDate}
                onChange={handleDetailChange}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Customer Name *
              </Typography>
              <TextField
                {...textProps}
                name="customerName"
                value={invoiceDetails.customerName}
                onChange={handleDetailChange}
                placeholder="Enter customer name"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                City
              </Typography>
              <TextField
                {...textProps}
                name="city"
                value={invoiceDetails.city}
                onChange={handleDetailChange}
                placeholder="Enter city"
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Address
              </Typography>
              <TextField
                {...textProps}
                name="address"
                value={invoiceDetails.address}
                onChange={handleDetailChange}
                placeholder="Enter address"
                multiline
                rows={3}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                Notes
              </Typography>
              <TextField
                {...textProps}
                name="notes"
                value={invoiceDetails.notes}
                onChange={handleDetailChange}
                placeholder="Additional notes"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Card>


        <Card variant="outlined" sx={{ p: 0, borderRadius: "8px" }}>
          <TableContainer component={Paper} elevation={0} sx={{ border: "none" }}>
            <Table size="small" sx={{ border: "none" }}>
              <TableHead sx={{ bgcolor: "#fafafa", borderBottom: "1px solid #eee" }}>
                <TableRow>
                  <TableCell width={60} sx={{ border: "none", py: 2, fontWeight: 600 }}>
                    S.No
                  </TableCell>
                  <TableCell width={300} sx={{ border: "none", fontWeight: 600 }}>
                    Item *
                  </TableCell>
                  <TableCell sx={{ border: "none", fontWeight: 600 }}>
                    Description
                  </TableCell>
                  <TableCell width={100} sx={{ border: "none", fontWeight: 600 }}>
                    Qty *
                  </TableCell>
                  <TableCell width={100} sx={{ border: "none", fontWeight: 600 }}>
                    Rate *
                  </TableCell>
                  <TableCell width={100} sx={{ border: "none", fontWeight: 600 }}>
                    Disc %
                  </TableCell>
                  <TableCell
                    width={120}
                    align="right"
                    sx={{ border: "none", fontWeight: 600, px: 3 }}
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    width={80}
                    align="center"
                    sx={{ border: "none", fontWeight: 600 }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {lineItems.map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ border: "none" }}>{index + 1}</TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <ItemSelect
                        size="small"
                        value={row.itemObject}
                        onChange={(event, val) =>
                          handleLineItemChange(row.id, "itemObject", val)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.description}
                        onChange={(e) =>
                          handleLineItemChange(row.id, "description", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleLineItemChange(row.id, "qty", parseInt(e.target.value))
                        }
                        inputProps={{ step: 1, min: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.rate}
                        onChange={(e) =>
                          handleLineItemChange(row.id, "rate", parseFloat(e.target.value))
                        }
                        inputProps={{ step: "0.01", min: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ border: "none" }}>
                      <TextField
                        size="small"
                        type="number"
                        value={row.discountPct}
                        onChange={(e) =>
                          handleLineItemChange(
                            row.id,
                            "discountPct",
                            parseFloat(e.target.value),
                          )
                        }
                        inputProps={{ step: "0.01", min: 0, max: 100 }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ border: "none", fontWeight: 600, fontSize: "15px", px: 3 }}
                    >
                      {company?.currencySymbol || "$"}{row.amount.toFixed(2)}
                    </TableCell>
                    <TableCell align="center" sx={{ border: "none" }}>
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: "center" }}>
                        <IconButton size="small" onClick={() => copyRow(row)}>
                          <ContentCopyIcon fontSize="small" color="action" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => deleteRow(row.id)}
                          disabled={lineItems.length === 1}
                        >
                          {/* Delete icon goes here */}
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 3 }}>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              sx={{
                color: "black",
                borderColor: "#ccc",
                textTransform: "none",
              }}
              onClick={addRow}
            >
              Add Row
            </Button>
          </Box>
        </Card>

        <Card variant="outlined" sx={{ p: 4, borderRadius: "8px" }}>
          <Grid container spacing={2} sx={{ alignItems: "flex-start" }}>
            {/* Left Side */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 400 }}
              >
                Invoice Totals
              </Typography>
            </Grid>

            {/* Right Side */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={2}>
                {/* Sub Total */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontWeight: 500 }}
                  >
                    Sub Total
                  </Typography>

                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {company?.currencySymbol || "$"}
                    {invoiceTotals.subTotal}
                  </Typography>
                </Stack>

                {/* Tax */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", fontWeight: 500 }}
                  >
                    Tax
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <TextField
                      size="small"
                      type="number"
                      value={taxPct}
                      onChange={(e) => setTaxPct(Number(e.target.value) || 0)}
                      sx={{ width: 100, bgcolor: "white" }}
                      inputProps={{
                        step: 0.1,
                        min: 0,
                        style: { textAlign: "right" },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      size="small"
                      disabled
                      value={taxAmt.toFixed(2)}
                      sx={{ width: 120, bgcolor: "#fcfcfc" }}
                      inputProps={{
                        style: { textAlign: "right" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {company?.currencySymbol || "$"}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                </Stack>

                <Divider />

                {/* Invoice Amount */}
                <Box
                  sx={{
                    bgcolor: "#f5f5f5",
                    p: 2.5,
                    borderRadius: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" fontWeight={500}>
                    Invoice Amount
                  </Typography>

                  <Typography variant="h4" fontWeight={600}>
                    {company?.currencySymbol || "$"}
                    {invoiceTotals.invoiceAmount}
                  </Typography>
                </Box>

                {/* Buttons */}
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="flex-end"
                  sx={{ mt: 2 }}
                >
                  <Button
                    variant="outlined"
                    onClick={cancelForm}
                    sx={{
                      textTransform: "none",
                      borderColor: "#000",
                      color: "#000",
                      px: 4,
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                      bgcolor: "#000",
                      "&:hover": {
                        bgcolor: "#333",
                      },
                      textTransform: "none",
                      px: 4,
                    }}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Card>

      </Stack>
    </Box>
  );
};

export default InvoiceForm;
