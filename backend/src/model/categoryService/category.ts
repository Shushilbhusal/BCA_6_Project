import { Category } from "./categoryModel.js";

export const addCategory = async (input: {
  categoryName: string;
  categoryDescription: string;
  imageUrl: string;
}) => {
  try {
    const addCategory = await Category.create(input);
    return addCategory;
  } catch (error) {
    console.log("error while adding category", error);
  }
};

export const getAllCategories = async () => {
  try {
    const categories = await Category.find({}).lean().exec();
    return categories;
  } catch (error) {
    console.log("error while getting all categories", error);
  }
};

export const getCategoryById = async (id: string) => {
  try {
    const category = await Category.findById(id).lean().exec();
    return category;
  } catch (error) {
    console.log("error while getting category by id", error);
  }
};

export const getCategoryByName = async (name: string) => {
  try {
    const category = await Category.findOne({ categoryName: name });
    return category;
  } catch (error) {
    console.log("error while getting category by name", error);
  }
};

export const deleteCategoryById = async (id: string) => {
  try {
    const deletedCategory = await Category.deleteOne({ _id: id });
    return deletedCategory;
  } catch (error) {
    console.log("error while deleting the category", error);
  }
};

export const updateCategoryById = async (
  id: string,
  input: {
    categoryName: string;
    categoryDescription: string;
    imageUrl?: string;
  }
) => {
  try {
    const updatedCategory = await Category.updateOne(
      {
        _id: id,
      },
      {
        $set: input,
      }
    );
    return updatedCategory;
  } catch (error) {
    console.log("error while updating Category", error);
    throw error;
  }
};
