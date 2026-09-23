import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    itemId: {
      type: Number,
      unique: true,
      required: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    salesRate: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPct: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    primaryKey: {
      type: Number,
      required: true,
    },

    createdByUserName: {
      type: String,
      required: true,
      trim: true,
    },

    // Item Image
    image: {
      data: {
        type: Buffer,
        default: null,
      },
      contentType: {
        type: String,
        default: null,
      },
    },

    createdOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const ItemModel = mongoose.model("Item", itemSchema);

export default ItemModel;