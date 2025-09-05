import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiImage } from "react-icons/fi";
import type { Category } from "./categories";
import type { Supplier } from "./suppliers";

type ProductType = {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  supplierId: string;
  supplierName: string;
  image: string;
  createdAt: string;
  updatedAt: string;
};


const Products = () => {
  // Form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    categoryName: "",
    supplierName: "",
    image: null as File | null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [productsList, setProductsList] = useState<ProductType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/product/getAllProducts",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        console.log("products", response.data.products);
        setProductsList(response.data.products);
        console.log("productsList", productsList);
      }
    } catch (error) {
      console.error("Error while getting products", error);
      setError("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and suppliers
  const fetchCategoriesAndSuppliers = async () => {
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        axios.get("http://localhost:5000/category/get", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get("http://localhost:5000/supplier/get", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
      ]);

      if (categoriesRes.status === 200) {
        setCategories(categoriesRes.data.category);
      }
      if (suppliersRes.status === 200) {
        setSuppliers(suppliersRes.data.supplier);
      }
    } catch (error) {
      console.error("Error while getting categories or suppliers", error);
      setError("Failed to fetch categories and suppliers");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndSuppliers();
  }, []);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.type === "file") {
      const files = e.target.files;
      if (files && files.length > 0) {
        setProductForm((prev) => ({
          ...prev,
          image: files[0],
        }));
      }
    } else {
      setProductForm((prev) => ({
        ...prev,
        [name]:
          name === "price" || name === "stock"
            ? Number(value)
            : value,
      }));
    }
  };

  // Clear form
  const clearForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryName: "",
      supplierName: "",
      image: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setEditProduct(null);
    setIsFormOpen(false);
  };

  // Handle add product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", productForm.price.toString());
      formData.append("stock", String(productForm.stock));
      formData.append("categoryName", productForm.categoryName);
      formData.append("supplierName", productForm.supplierName);
     
      if (productForm.image) {
        formData.append("image", productForm.image);
      }
      const response = await axios.post(
        "http://localhost:5000/product/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        
        alert("Product added successfully");
        clearForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Error adding product", error);
      alert("Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (product: ProductType) => {
    setEditProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryName: product.categoryName,
      supplierName: product.supplierName,
      image: null,
    });
    setIsFormOpen(true);
  };

  // Handle save changes
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!editProduct) return;

    try {
      const formData = new FormData();
      formData.append("name", productForm.name);
      formData.append("description", productForm.description);
      formData.append("price", String(productForm.price));
      formData.append("stock", String(productForm.stock));
      formData.append("categoryName", productForm.categoryName);
      formData.append("supplierName", productForm.supplierName);

      if (productForm.image) {
        formData.append("image", productForm.image);
      }

      const response = await axios.put(
        `http://localhost:5000/product/update/${editProduct._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Product updated successfully");
        clearForm();
        fetchProducts();
      }
    } catch (error) {
      console.error("Error updating product", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/product/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Product deleted successfully");
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product", error);
        alert("Failed to delete product");
      }
    }
  };

  // Filter products
  const filteredProducts = productsList.filter((product) =>
    (product.name ?? "")
      .toLowerCase()
      .includes((searchTerm ?? "").toLowerCase())
  );



  if (loading && productsList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8 text-center">
        Product Management
      </h1>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto justify-center"
        >
          <FiPlus /> Add New Product
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-100 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editProduct ? "Update Product" : "Add New Product"}
              </h2>
              <button
                onClick={clearForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <RxCross2 size={24} />
              </button>
            </div>
            <div className="fixed inset-0 bg-gray-200  bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {editProduct ? "Update Product" : "Add New Product"}
                  </h2>
                  <button
                    onClick={clearForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RxCross2 size={20} />
                  </button>
                </div>

                <form
                  onSubmit={editProduct ? handleSaveChanges : handleAddProduct}
                  className="p-5 space-y-4"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Product name"
                        value={productForm.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-2 text-gray-400 text-sm">
                            Rs.
                          </span>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={productForm.price || ""}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                          Stock *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          placeholder="0"
                          value={productForm.stock || ""}
                          onChange={handleChange}
                          min="0"
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                          Category *
                        </label>
                        <select
                          name="categoryName"
                          value={productForm.categoryName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                          Supplier *
                        </label>
                        <select
                          name="supplierName"
                          value={productForm.supplierName}
                          onChange={handleChange}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                          required
                        >
                          <option value="">Select supplier</option>
                          {suppliers.map((supplier) => (
                            <option key={supplier._id} value={supplier._id}>
                              {supplier.supplierName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                        Product Image
                      </label>
                      <div className="flex items-center gap-3">
                        <label className="flex flex-col items-center justify-center w-20 h-20 border border-dashed border-gray-300 rounded-md cursor-pointer hover:border-indigo-400 transition-colors overflow-hidden">
                          {productForm.image ? (
                            <img
                              src={URL.createObjectURL(
                                productForm.image
                              )}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-gray-400">
                              <FiImage size={16} />
                              <span className="text-xs mt-1">Upload</span>
                            </div>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleChange}
                            className="hidden"
                            accept="image/*"
                          />
                        </label>
                        <div className="text-xs text-gray-500 flex-1">
                          <p>JPG, PNG or GIF</p>
                          <p>Max 5MB</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        placeholder="Product description"
                        value={productForm.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white py-2 text-sm rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                          Processing...
                        </span>
                      ) : (
                        <span>{editProduct ? "Update" : "Add Product"}</span>
                      )}
                    </button>

                    <button
                      type="button"
                      className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
                      onClick={clearForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Product List</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredProducts.length} products found
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FiImage size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4">
              {productsList.length === 0
                ? "Get started by adding your first product."
                : "No products match your search."}
            </p>
            {productsList.length === 0 && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus /> Add Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.image ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                               src={product.image}
                               alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <FiImage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Rs.{Number(product.price ?? 0).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10
                            ? "bg-green-100 text-green-800"
                            : product.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.categoryName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.supplierName}                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠</span>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              <RxCross2 />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
