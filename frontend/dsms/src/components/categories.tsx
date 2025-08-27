import axios from "axios";
import React, { useState, useRef, useEffect } from "react";

type Category = {
  _id: string;
  categoryName: string;
  categoryDescription: string;
  imageUrl: string;
};

function Categories() {
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<File | null | string>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Changed to hold the entire category object instead of just ID
  const [editCategory, setEditCategory] = useState<Category | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const responseCategory = await axios.get(
          "http://localhost:5000/category/get",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (responseCategory.status === 200) {
          setCategories(responseCategory.data.category);
        }
      } catch (error) {
        console.log("error while getting categories", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("image", imageUrl as Blob);
    formData.append("categoryName", categoryName);
    formData.append("categoryDescription", categoryDescription);

    try {
      const response = await axios.post(
        "http://localhost:5000/category/add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Category added successfully");
        setCategoryName("");
        setCategoryDescription("");
        setImageUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Refresh categories
        const updatedCategories = await axios.get(
          "http://localhost:5000/category/get",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(updatedCategories.data.category);
      }
    } catch (error) {
      console.log("Error adding category", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/category/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        alert("Category deleted successfully");

        // Refresh categories
        const updatedCategories = await axios.get(
          "http://localhost:5000/category/get",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(updatedCategories.data.category);
      } catch (error) {
        console.log("Error deleting category:", error);
        alert("Failed to delete category");
      }
    }
  };

  // This function just prepares the form for editing
  const handleUpdateCategory = (category: Category) => {
    // Set the form fields with the category data to edit
    setEditCategory(category);
    setCategoryName(category.categoryName);
    setCategoryDescription(category.categoryDescription);
    setImageUrl(category.imageUrl);
  };

  // NEW FUNCTION: This handles the actual update submission
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("categoryName", categoryName);
      formData.append("categoryDescription", categoryDescription);

      // Only append image if it's a new file (not a string URL)
      if (typeof imageUrl !== "string" && imageUrl) {
        formData.append("image", imageUrl);
      }

      const response = await axios.put(
        `http://localhost:5000/category/update/${editCategory._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        alert("Category updated successfully");
        handleCalcelUpdate();

        // Refresh categories
        const updatedCategories = await axios.get(
          "http://localhost:5000/category/get",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCategories(updatedCategories.data.category);
      }
    } catch (error) {
      console.log("Error updating category:", error);
      alert("Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleCalcelUpdate = () => {
    setEditCategory(null);
    setCategoryName("");
    setCategoryDescription("");
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8 text-center">
        Category Management
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form Section - Left Side */}
        <div className="w-full lg:w-2/5">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              {editCategory ? "Update Category" : "Add New Category"}
            </h2>

            {/* FIX: Use different form handler based on mode */}
            <form
              onSubmit={editCategory ? handleSaveUpdate : handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Enter category description"
                  value={categoryDescription}
                  onChange={(e) => setCategoryDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageUrl(file);
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-3 w-full">
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-500 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Loading...
                    </span>
                  ) : (
                    // FIX: Simplified button text - removed the broken onClick
                    <span>
                      {editCategory ? "Save Changes" : "Add Category"}
                    </span>
                  )}
                </button>

                {/* Cancel button (only when editing) */}
                {editCategory && (
                  <button
                    type="button" // Prevents accidental form submit
                    className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors duration-200"
                    onClick={handleCalcelUpdate}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table Section - Right Side */}
        <div className="w-full lg:w-3/5">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Existing Categories
            </h2>

            {categories.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No categories found. Add your first category using the form.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        S.N
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category) => (
                      <tr
                        key={category._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {categories.indexOf(category) + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.categoryName || category.categoryName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          <div className="line-clamp-2">
                            {category.categoryDescription ||
                              category.categoryDescription}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <img
                            src={category.imageUrl || category.imageUrl}
                            alt={category.categoryName || category.categoryName}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-blue-200 transition-colors duration-200 mr-1"
                            onClick={() => handleUpdateCategory(category)}
                          >
                            Update
                          </button>
                          <button
                            className="bg-red-100 text-red-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-200 transition-colors duration-200"
                            onClick={() => handleDeleteCategory(category._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Categories;
