import InvoiceModel from "../model/invoice.model.js";
import ItemModel from "../model/item.model.js";
import getNextSequence from "../utils/counter.js";

export const addInvoice = async (req, res) => {
  try {
    const {
      invoiceDate,
      customerName,
      address,
      city,
      items,
      notes,
      taxPercentage,
    } = req.body;

    const { userId, companyId, email } = req.user;

    // Required fields
    if (
      !invoiceDate ||
      !customerName ||
      !address ||
      !city ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // Generate Invoice ID
    const invoiceID = await getNextSequence("invoiceID");

    const invoiceNo = String(invoiceID);
    const primaryKeyID = invoiceID;

    const invoiceItems = [];
    let subTotal = 0;

    // Process items
    for (const data of items) {
      const item = await ItemModel.findOne({
        itemId: Number(data.itemId),
        createdByUserName: email,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item ${data.itemId} not found or access denied`,
        });
      }

      const quantity = Number(data.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item ${data.itemId}`,
        });
      }

      const salesRate = Number(item.salesRate) || 0;
      const discountPct = Number(item.discountPct) || 0;

      const grossAmount = salesRate * quantity;

      const discountAmount = (grossAmount * discountPct) / 100;

      const amount = grossAmount - discountAmount;

      subTotal += amount;

      console.log(item);

      invoiceItems.push({
        itemId: item.itemId,
        itemName: item.itemName,
        description: item.description,
        quantity,
        salesRate,
        discountPct,
        amount: Number(amount.toFixed(2)),
      });
    }

    // Tax calculation
    const taxPct = Number(taxPercentage) || 0;

    const taxAmount = (subTotal * taxPct) / 100;

    const invoiceAmount = subTotal + taxAmount;

    const invoice = new InvoiceModel({
      userId,
      companyId,

      createdByUserName: email,
      createdOn: new Date(),

      invoiceDate,

      customerName,
      address,
      city,

      invoiceID,
      invoiceNo,
      primaryKeyID,

      items: invoiceItems,

      notes: notes || "",

      subTotal: Number(subTotal.toFixed(2)),

      taxPercentage: taxPct,

      taxAmount: Number(taxAmount.toFixed(2)),

      invoiceAmount: Number(invoiceAmount.toFixed(2)),

      totalItems: invoiceItems.length,
    });

    await invoice.save();

    return res.status(201).json({
      success: true,
      message: "Invoice added successfully",
      invoice,
    });
  } catch (error) {
    console.error("Add Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getInvoiceList = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    // Get logged-in user from JWT
    const { email } = req.user;

    // Filter by logged-in user's email
    const filter = {
      createdByUserName: email,
    };

    // Date filter
    if (fromDate || toDate) {
      filter.invoiceDate = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        if (isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate",
          });
        }

        startDate.setHours(0, 0, 0, 0);

        filter.invoiceDate.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        if (isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate",
          });
        }

        endDate.setHours(23, 59, 59, 999);

        filter.invoiceDate.$lte = endDate;
      }
    }

    const invoices = await InvoiceModel.find(filter).sort({ invoiceDate: -1 });

    return res.status(200).json(invoices);
  } catch (error) {
    console.error("Get Invoice List Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getInvoiceById = async (req, res) => {
  try {
    const invoiceID = Number(req.params.id);

    // Validate invoice ID
    if (!Number.isInteger(invoiceID) || invoiceID <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    // Get logged-in user from JWT
    const { email } = req.user;

    // Find invoice belonging to logged-in user
    const invoice = await InvoiceModel.findOne({
      invoiceID,
      createdByUserName: email,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error("Get Invoice By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const invoiceID = Number(req.params.id);

    // Validate invoice ID
    if (!Number.isInteger(invoiceID) || invoiceID <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const { invoiceDate, customerName, city, items, notes, taxPercentage } =
      req.body;

    // Logged-in user from JWT
    const { email } = req.user;

    // Find existing invoice
    const existingInvoice = await InvoiceModel.findOne({
      invoiceID,
      createdByUserName: email,
    });

    if (!existingInvoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or access denied",
      });
    }

    // Validate items
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invoice must contain at least one item",
      });
    }

    const invoiceItems = [];
    let subTotal = 0;

    // Process invoice items
    for (const data of items) {
      const itemId = Number(data.itemId);

      if (!Number.isInteger(itemId) || itemId <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid item ID: ${data.itemId}`,
        });
      }

      const item = await ItemModel.findOne({
        itemId,
        createdByUserName: email,
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item ${itemId} not found or access denied`,
        });
      }

      const quantity = Number(data.quantity);

      if (!Number.isFinite(quantity) || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for item ${itemId}`,
        });
      }

      const salesRate = Number(item.salesRate) || 0;
      const discountPct = Number(item.discountPct) || 0;
      const grossAmount = salesRate * quantity;
      const discountAmount = (grossAmount * discountPct) / 100;
      const amount = grossAmount - discountAmount;

      subTotal += amount;

      console.log(item);

      invoiceItems.push({
        itemId: item.itemId,
        itemName: item.itemName,
        description: item.description,
        quantity,
        salesRate,
        discountPct,
        amount: Number(amount.toFixed(2)),
      });
    }

    // Tax calculation
    const taxPct = Number(taxPercentage) || 0;

    const taxAmount = (subTotal * taxPct) / 100;

    const invoiceAmount = subTotal + taxAmount;

    // Update invoice
    const updatedInvoice = await InvoiceModel.findOneAndUpdate(
      {
        invoiceID,
        createdByUserName: email,
      },
      {
        invoiceDate,
        customerName,
        city,
        items: invoiceItems,
        notes: notes || "",

        // Keep field name exactly as your database/schema
        subTotal: Number(subTotal.toFixed(2)),

        taxPercentage: taxPct,

        taxAmount: Number(taxAmount.toFixed(2)),

        invoiceAmount: Number(invoiceAmount.toFixed(2)),

        totalItems: invoiceItems.length,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice: updatedInvoice,
    });
  } catch (error) {
    console.error("Update Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const deleteInvoice = async (req, res) => {
  try {
    const invoiceID = Number(req.params.id);

    // Validate invoice ID
    if (!Number.isInteger(invoiceID) || invoiceID <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    // Get logged-in user from JWT
    const { email } = req.user;

    const invoice = await InvoiceModel.findOneAndDelete({
      invoiceID,
      createdByUserName: email,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
      invoiceID: invoice.invoiceID,
    });
  } catch (error) {
    console.error("Delete Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getInvoiceMetrics = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const { email } = req.user;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "User email not found in token.",
      });
    }

    const filter = {
      createdByUserName: email,
    };

    if (fromDate || toDate) {
      filter.invoiceDate = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate.",
          });
        }

        startDate.setHours(0, 0, 0, 0);
        filter.invoiceDate.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate.",
          });
        }

        endDate.setHours(23, 59, 59, 999);
        filter.invoiceDate.$lte = endDate;
      }
    }

    const result = await InvoiceModel.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,

          invoiceCount: {
            $sum: 1,
          },

          totalAmount: {
            $sum: {
              $ifNull: ["$invoiceAmount", 0],
            },
          },
        },
      },
    ]);

    const metrics = result[0] || {
      invoiceCount: 0,
      totalAmount: 0,
    };

    return res.status(200).json({
      invoiceCount: metrics.invoiceCount,
      totalAmount: metrics.totalAmount,
    });
  } catch (error) {
    console.error("Invoice Metrics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getTopItems = async (req, res) => {
  try {
    const { fromDate, toDate, topN = 5 } = req.query;
    const { email } = req.user;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "User email not found in token.",
      });
    }

    const limit = Number(topN);

    if (!Number.isInteger(limit) || limit <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid topN value.",
      });
    }

    const filter = {
      createdByUserName: email,
    };

    // Date filter
    if (fromDate || toDate) {
      filter.invoiceDate = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        if (Number.isNaN(startDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid fromDate.",
          });
        }

        startDate.setHours(0, 0, 0, 0);
        filter.invoiceDate.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        if (Number.isNaN(endDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid toDate.",
          });
        }

        endDate.setHours(23, 59, 59, 999);
        filter.invoiceDate.$lte = endDate;
      }
    }

    const items = await InvoiceModel.aggregate([
      // Filter invoices
      {
        $match: filter,
      },

      // Expand invoice items
      {
        $unwind: "$items",
      },

      // Group by item
      {
        $group: {
          _id: "$items.itemId",

          itemName: {
            $first: "$items.itemName",
          },

          quantity: {
            $sum: {
              $ifNull: ["$items.quantity", 0],
            },
          },

          amountSum: {
            $sum: {
              $ifNull: ["$items.amount", 0],
            },
          },
        },
      },

      // Highest quantity first
      {
        $sort: {
          quantity: -1,
        },
      },

      // Only top 5
      {
        $limit: limit,
      },

      // Final response
      {
        $project: {
          _id: 0,
          itemID: "$_id",
          itemName: 1,
          quantity: 1,
          amountSum: 1,
        },
      },
    ]);

    return res.status(200).json(items);
  } catch (error) {
    console.error("Get Top Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getInvoiceTrend12m = async (req, res) => {
  try {
    const { email } = req.user;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "User email not found in token.",
      });
    }

    // ------------------------------------------
    // Current date
    // ------------------------------------------
    const now = new Date();

    // Start of current month
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0,
    );

    // Start of month 11 months ago
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - 11,
      1,
      0,
      0,
      0,
      0,
    );

    // End of current month
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // ------------------------------------------
    // Get invoice data
    // ------------------------------------------
    const result = await InvoiceModel.aggregate([
      {
        $match: {
          createdByUserName: email,

          invoiceDate: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },

      // ------------------------------------------
      // Group by year + month
      // ------------------------------------------
      {
        $group: {
          _id: {
            year: {
              $year: "$invoiceDate",
            },
            month: {
              $month: "$invoiceDate",
            },
          },

          invoiceCount: {
            $sum: 1,
          },

          amountSum: {
            $sum: {
              $ifNull: ["$invoiceAmount", 0],
            },
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // ------------------------------------------
    // Create lookup map
    // ------------------------------------------
    const resultMap = new Map();

    result.forEach((item) => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;

      resultMap.set(key, {
        invoiceCount: item.invoiceCount,
        amountSum: item.amountSum,
      });
    });

    // ------------------------------------------
    // Always return exactly 12 months
    // ------------------------------------------
    const chartData = [];

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1,
      );

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const key = `${year}-${String(month).padStart(2, "0")}`;

      const monthData = resultMap.get(key);

      chartData.push({
        monthStart: `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`,
        invoiceCount: monthData?.invoiceCount || 0,
        amountSum: monthData?.amountSum || 0,
      });
    }

    return res.status(200).json(chartData);
  } catch (error) {
    console.error("Invoice Trend 12 Months Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
