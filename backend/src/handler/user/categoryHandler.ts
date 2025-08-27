import type { Request, Response } from "express";
import {
  addCategory,
  deleteCategoryById,
  getAllCategories,
  getCategoryById,
  getCategoryByName,
  updateCategoryById,
} from "../../model/categoryService/category.js";
import { uploadToCloudinary } from "../../utils/uploadTocloudinary.js";

export const createCategoryHandler = async (req: Request, res: Response) => {
  const { categoryName, categoryDescription } = req.body;

  //  Validate required fields
  if (!categoryName || !categoryDescription) {
    return res
      .status(400)
      .json({ message: "Category name and description are required" });
  }

  //  Check if category already exists
  const findCategory = await getCategoryByName(categoryName as string);
  if (findCategory) {
    return res.status(400).json({ message: "Category already exists" });
  }

  //  Check file upload
  if (!req.file) {
    return res.status(400).json({ message: "File not uploaded" });
  }

  //  Upload file to Cloudinary
  const uploadedImageUrl = await uploadToCloudinary(req.file.path);
  if (!uploadedImageUrl) {
    return res.status(400).json({ message: "Image upload failed" });
  }

  //  Add category to database
  const category = await addCategory({
    categoryName: categoryName as string,
    categoryDescription: categoryDescription as string,
    imageUrl: uploadedImageUrl, // store Cloudinary URL
  });

  if (!category) {
    return res.status(500).json({ message: "Category could not be added" });
  }

  return res
    .status(201)
    .json({ message: "Category added successfully", category });
};

export const getCategoryHandler = async (req: Request, res: Response) => {
  try {
    const category = await getAllCategories();
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }
    return res
      .status(200)
      .json({ message: "Category found successfully", category });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
  }
};

export const deleteCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Category id is required" });
    }
    const findCategory = await getCategoryById(id);
    if (!findCategory) {
      return res.status(404).json({ message: "Category does not found" });
    }
    const deletedCategory = await deleteCategoryById(id);
    if (deletedCategory) {
      return res.status(200).json({ "deleted successfully": deletedCategory });
    }
  } catch (error) {
    console.log("error while deleting category", error);
    return res.status(400).json({ "could not deleted category": error });
  }
};

export const updateCategoryHandler = async (req: Request, res: Response) => {
  try {
    const { categoryName, categoryDescription } = req.body;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Category id is required" });
    }

    if (!categoryDescription && !categoryName) {
      return res.status(400).json({ message: "Fields are not filled" });
    }

    const findCategory = await getCategoryById(id);
    if (!findCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If a new file was uploaded, use it, otherwise keep the old image
    const imageUrl = req.file ? req.file.path : findCategory.imageUrl;

    //  Upload file to Cloudinary
    const uploadedImageUrl = await uploadToCloudinary(imageUrl);
    if (!uploadedImageUrl) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    const updateCategory = await updateCategoryById(id, {
      categoryName,
      categoryDescription,
      imageUrl,
    });

    if (!updateCategory) {
      return res.status(400).json({ message: "Category could not be updated" });
    }

    return res.status(200).json({ message: "Category updated successfully" });
  } catch (error) {
    console.log("Error while updating category:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
