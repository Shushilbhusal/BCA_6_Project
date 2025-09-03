import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiImage
} from "react-icons/fi";
import type{ Category } from "./categories";
import type{ Supplier } from "./suppliers";

interface ProductType {
  _id: string;
  productName: string;
  productDescription: string;
  productPrice: number;
  productStock: number;
  productCategory: string;
  productSupplier: string;
  productImage?: string;
  categoryName?: string;
  supplierName?: string;
}

const Products = () => {
  // Form state
  const [productForm, setProductForm] = useState({
    productName: "",
    productDescription: "",
    productPrice: 0,
    productStock: 0,
    productCategory: "",
    productSupplier: "",
    productImage: null as File | null,
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
        setProductsList(response.data.products);
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
        axios.get("http://localhost:5000/category/getAllCategories", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }),
        axios.get("http://localhost:5000/supplier/getAllSuppliers", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ]);

      if (categoriesRes.status === 200) {
        setCategories(categoriesRes.data.categories);
      }
      if (suppliersRes.status === 200) {
        setSuppliers(suppliersRes.data.suppliers);
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
        setProductForm(prev => ({
          ...prev,
          productImage: files[0]
        }));
      }
    } else {
      setProductForm(prev => ({
        ...prev,
        [name]: name === "productPrice" || name === "productStock" 
          ? Number(value) 
          : value
      }));
    }
  };

  // Clear form
  const clearForm = () => {
    setProductForm({
      productName: "",
      productDescription: "",
      productPrice: 0,
      productStock: 0,
      productCategory: "",
      productSupplier: "",
      productImage: null,
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
      formData.append("productName", productForm.productName);
      formData.append("productDescription", productForm.productDescription);
      formData.append("productPrice", String(productForm.productPrice));
      formData.append("productStock", String(productForm.productStock));
      formData.append("productCategory", productForm.productCategory);
      formData.append("productSupplier", productForm.productSupplier);

      if (productForm.productImage) {
        formData.append("productImage", productForm.productImage);
      }

      const response = await axios.post(
        "http://localhost:5000/product/create",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
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
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice,
      productStock: product.productStock,
      productCategory: product.productCategory,
      productSupplier: product.productSupplier,
      productImage: null,
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
      formData.append("productName", productForm.productName);
      formData.append("productDescription", productForm.productDescription);
      formData.append("productPrice", String(productForm.productPrice));
      formData.append("productStock", String(productForm.productStock));
      formData.append("productCategory", productForm.productCategory);
      formData.append("productSupplier", productForm.productSupplier);

      if (productForm.productImage) {
        formData.append("productImage", productForm.productImage);
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
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get category name by ID
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.categoryName : "Unknown";
  };

  // Get supplier name by ID
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(sup => sup._id === supplierId);
    return supplier ? supplier.supplierName : "Unknown";
  };

  if (loading && productsList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {editProduct ? "Update Product" : "Add New Product"}
              </h2>
              <button onClick={clearForm} className="text-gray-500 hover:text-gray-700">
                <RxCross2 size={24} />
              </button>
            </div>
            
            <form
              onSubmit={editProduct ? handleSaveChanges : handleAddProduct}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="productName"
                    placeholder="Enter product name"
                    value={productForm.productName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="productPrice"
                    placeholder="Enter product price"
                    value={productForm.productPrice || ""}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock *
                  </label>
                  <input
                    type="number"
                    name="productStock"
                    placeholder="Enter product stock"
                    value={productForm.productStock || ""}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="productCategory"
                    value={productForm.productCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier *
                  </label>
                  <select
                    name="productSupplier"
                    value={productForm.productSupplier}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                    required
                  >
                    <option value="">Select a supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier._id}>
                        {supplier.supplierName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-colors">
                      {productForm.productImage ? (
                        <img 
                          src={URL.createObjectURL(productForm.productImage)} 
                          alt="Preview" 
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 text-gray-500">
                          <FiImage size={24} />
                          <span className="text-sm mt-2">Upload Image</span>
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
                    <div className="text-sm text-gray-500">
                      <p>Upload a product image</p>
                      <p className="text-xs">JPG, PNG or GIF (max 5MB)</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="productDescription"
                    placeholder="Enter product description"
                    value={productForm.productDescription}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-500 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
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
                    <span>{editProduct ? "Save Changes" : "Add Product"}</span>
                  )}
                </button>

                <button
                  type="button"
                  className="px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
                  onClick={clearForm}
                >
                  Cancel
                </button>
              </div>
            </form>
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
                          {product.productImage ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={`http://localhost:5000/${product.productImage}`}
                              alt={product.productName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <FiImage className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.productName}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                            {product.productDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${product.productPrice.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.productStock > 10 ? 'bg-green-100 text-green-800' : product.productStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {product.productStock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(product.productCategory)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getSupplierName(product.productSupplier)}
                    </td>
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