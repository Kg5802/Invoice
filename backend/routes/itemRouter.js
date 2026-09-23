import express from "express";

import {
  addItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  updateItemPicture,
  getItemPicture,
} from "../controller/itemController.js";

import upload from "../middleware/upload.js";

import ensureAuthenticated from "../middleware/ensureAuthenticated.js";
import multer from "multer";

const router = express.Router();

router.get("/GetList", ensureAuthenticated, getAllItems);

router.post("/", ensureAuthenticated, addItem);

router.get("/:id", ensureAuthenticated, getItemById);

router.put("/:id", ensureAuthenticated, updateItem);

router.delete("/:id", ensureAuthenticated, deleteItem);

router.put(
  "/:id/picture",
  ensureAuthenticated,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "Image size must not exceed 5MB.",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image.",
        });
      }

      next();
    });
  },
  updateItemPicture
);

router.get("/:id/picture", getItemPicture);

export default router;
