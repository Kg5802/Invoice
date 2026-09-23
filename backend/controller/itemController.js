import ItemModel from "../model/item.model.js";
import getNextSequence from "../utils/counter.js";

export const addItem = async (req, res) => {
  try {
    const { itemName, description, salesRate, discountPct } = req.body;

    if (!itemName || !salesRate) {
      return res.status(400).json({
        success: false,
        message: "Item name and sales rate are required",
      });
    }

    const { email } = req.user;

    const itemId = await getNextSequence("itemId");

    const itemData = {
      itemId,
      primaryKey: itemId,
      itemName,
      description: description || "",
      salesRate: Number(salesRate),
      discountPct: Number(discountPct) || 0,
      createdByUserName: email,
    };

    
    if (req.file) {
      itemData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    }

    const item = await ItemModel.create(itemData);

    return res.status(201).json({
      success: true,
      message: "Item added successfully",
      item,
    });
  } catch (error) {
    console.error("Add Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllItems = async (req, res) => {
  try {
    const { email } = req.user;

    const items = await ItemModel.find({
      createdByUserName: email,
    }).sort({ itemId: 1 });

    return res.status(200).json(items);
  } catch (error) {
    console.error("Get Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getItemById = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID",
        success: false,
      });
    }

    const { userId, companyId } = req.user;

    const item = await ItemModel.findOne({
      itemId,
      userId,
      companyId,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found or access denied",
        success: false,
      });
    }

    return res.status(200).json(item);
  } catch (err) {
    console.error("Get Item Error:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID",
        success: false,
      });
    }

    const { itemName, description, salesRate, discountPct } = req.body;

    const item = await ItemModel.findOneAndUpdate(
      {
        itemId,
      },
      {
        itemName,
        description,
        salesRate: Number(salesRate),
        discountPct: Number(discountPct) || 0,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found or access denied",
        success: false,
      });
    }

    return res.status(200).json(item);
  } catch (err) {
    console.error("Update Item Error:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!itemId || Number.isNaN(itemId)) {
      return res.status(400).json({
        message: "Invalid item ID",
        success: false,
      });
    }

    const item = await ItemModel.findOneAndDelete({
      itemId,
    });

    if (!item) {
      return res.status(404).json({
        message: "Item not found or access denied",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Item deleted successfully",
      success: true,
    });
  } catch (err) {
    console.error("Delete Item Error:", err);

    return res.status(500).json({
      message: err.message,
    });
  }
};

export const updateItemPicture = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    if (!Number.isInteger(itemId) || itemId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const { email } = req.user;

    const item = await ItemModel.findOne({
      itemId,
      createdByUserName: email,
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found or access denied",
      });
    }

    item.image = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Item image updated successfully",
      itemId: item.itemId,
    });
  } catch (error) {
    console.error("Update Item Picture Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getItemPicture = async (req, res) => {
  try {
    const itemId = Number(req.params.id);

    const item = await ItemModel.findOne({
      itemId,
    }).select("image");

    if (!item?.image?.data) {
      return res.status(404).json({
        success: false,
        message: "Item image not found",
      });
    }

    res.set("Content-Type", item.image.contentType);

    return res.send(item.image.data);
  } catch (error) {
    console.error("Get Item Picture Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
