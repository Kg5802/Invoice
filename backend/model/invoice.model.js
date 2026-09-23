import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    itemId: {
      type: Number,
      required: true,
    },

    itemName: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    salesRate: {
      type: Number,
      required: true,
    },

    discountPct: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    createdByUserName: { type: String, required: true, trim: true },
    createdOn: { type: Date, required: true, default: Date.now },

    customerName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },

    invoiceAmount: { type: Number, required: true, default: 0 },
    invoiceDate: { type: Date, required: true },

    invoiceID: { type: Number, unique: true, required: true },
    invoiceNo: { type: String, required: true },
    primaryKeyID: { type: Number, required: true },

    subTotal: { type: Number, required: true, default: 0 },
    taxAmount: { type: Number, default: 0 },
    taxPercentage: { type: Number, default: 0 },
    totalItems: { type: Number, required: true },

    items: { type: [invoiceItemSchema], required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

const InvoiceModel = mongoose.model("Invoice", invoiceSchema);

export default InvoiceModel;
