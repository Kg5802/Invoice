import { Router } from "express";

import ensureAuthenticated from "../middleware/ensureAuthenticated.js";

import {
  addInvoice,
  getInvoiceList,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoiceMetrics,
  getTopItems,
  getInvoiceTrend12m,
} from "../controller/invoiceController.js";

const invoiceRouter = Router();

invoiceRouter.get(
  "/GetList",
  ensureAuthenticated,
  getInvoiceList
);

invoiceRouter.get(
  "/GetMetrices",
  ensureAuthenticated,
  getInvoiceMetrics
);

invoiceRouter.get(
  "/GetTrend12m",
  ensureAuthenticated,
  getInvoiceTrend12m
);

invoiceRouter.get(
  "/TopItems",
  ensureAuthenticated,
  getTopItems
);

invoiceRouter.post(
  "/",
  ensureAuthenticated,
  addInvoice
);

invoiceRouter.get(
  "/:id",
  ensureAuthenticated,
  getInvoiceById
);

invoiceRouter.put(
  "/:id",
  ensureAuthenticated,
  updateInvoice
);

invoiceRouter.delete(
  "/:id",
  ensureAuthenticated,
  deleteInvoice
);

export default invoiceRouter;