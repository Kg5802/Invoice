import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    companyId: {
      type: Number,
      unique: true,
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    zipCode: {
      type: String,
      required: true,
      trim: true,
    },

    industry: {
      type: String,
      required: true,
      trim: true,
    },

    currencySymbol: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const CompanyModel = mongoose.model("Company", companySchema);

export default CompanyModel;