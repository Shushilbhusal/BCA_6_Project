import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { RxCross2 } from "react-icons/rx";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiImage, FiUpload } from "react-icons/fi";

// Error Boundary (unchanged)
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg text-left mb-6">
              <p className="text-sm font-mono text-gray-800 break-words">
                {this.state.error?.toString()}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Types (unchanged)
interface Category {
  _id: string;
  categoryName: string;
}

interface Supplier {
  _id: string;
  supplierName: string;
}

interface Product {
  _id: string;
  productName: string;
  productPrice?: number;
  productStock?: number;
  productCategory?: string;
  productSupplier?: string;
  productDescription?: string;
  productImage?: string | File | null;
}

// Component
const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<Omit<Product, "_id">>({
    productName: "",
    productPrice: 0,
    productStock: 0,
    productCategory: "",
    productSupplier: "",
    productDescription: "",
    productImage: null,
  });
  const [addProduct, setAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState<null | Product>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch categories and suppliers with useCallback to prevent recreation
  const fetchCategoriesSuppliers = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/product/get", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.status === 200) {
        console.log("data of categories and suppliers", response.data);
        setCategories(Array.isArray(response.data.categories) ? response.data.categories : []);
        setSuppliers(Array.isArray(response.data.suppliers) ? response.data.suppliers : []);
      }
    } catch (err) {
      console.error("Error fetching categories/suppliers:", err);
    }
  }, []);

  // Fetch all products with useCallback
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/product/getAllProducts");
      if (response.status === 200) {
        const productsData = Array.isArray(response.data.products) ? response.data.products : [];
        setProducts(productsData);
        console.log("fetched products.........", productsData);
        setFilteredProducts(productsData);
      }
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Error fetching products");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetching
  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchProducts();
      await fetchCategoriesSuppliers();
    };
    
    fetchInitialData();
  }, [fetchProducts, fetchCategoriesSuppliers]);

  // Filter products on search
  useEffect(() => {
    const filtered = products.filter((p) => {
      const name = p.productName ?? "";
      const desc = p.productDescription ?? "";
      const category = categories.find(c => c._id === p.productCategory)?.categoryName ?? "";
      const supplier = suppliers.find(s => s._id === p.productSupplier)?.supplierName ?? "";
      
      return (
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredProducts(filtered);
  }, [searchTerm, products, categories, suppliers]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "file" && (e.target as HTMLInputElement).files) {
      const file = (e.target as HTMLInputElement).files![0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === "productPrice" || name === "productStock"
          ? Number(value)
          : value,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      productName: "",
      productPrice: 0,
      productStock: 0,
      productCategory: "",
      productSupplier: "",
      productDescription: "",
      productImage: null,
    });
    setEditProduct(null);
    setError(null);
    setImagePreview(null);
  };

  const closeModal = () => {
    setAddProduct(false);
    setEditProduct(null);
    resetForm();
  };

  const submitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("productName", formData.productName);
    data.append("productPrice", formData.productPrice?.toString() ?? "0");
    data.append("productStock", formData.productStock?.toString() ?? "0");
    data.append("productCategory", formData.productCategory ?? "");
    data.append("productSupplier", formData.productSupplier ?? "");
    data.append("productDescription", formData.productDescription ?? "");
    if (formData.productImage && typeof formData.productImage !== "string") {
      data.append("productImage", formData.productImage);
    }

    try {
      if (editProduct?._id) {
        const response = await axios.put(
          `http://localhost:5000/product/update/${editProduct._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 200) {
          alert("Product updated successfully");
        }
      } else {
        const response = await axios.post(
          "http://localhost:5000/product/create",
          data,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        if (response.status === 201) {
          alert("Product added successfully");
        }
      }
      fetchProducts();
      closeModal();
    } catch (err: any) {
      console.error("Error submitting product:", err);
      setError(err.response?.data?.message || "Error submitting product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      productName: product.productName,
      productPrice: product.productPrice,
      productStock: product.productStock,
      productCategory: product.productCategory,
      productSupplier: product.productSupplier,
      productDescription: product.productDescription,
      productImage: product.productImage,
    });
    
    if (typeof product.productImage === "string") {
      setImagePreview(product.productImage);
    }
    
    setEditProduct(product);
    setAddProduct(true);
  };

  const deleteProduct = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/product/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      alert("Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  Product Management
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage your products and inventory
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Products Table */}
            {loading && !addProduct ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-8 text-center">
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No products found
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
                </p>
                <button
                  onClick={() => setAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Add Product
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Supplier
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => {
                      const category = categories.find(c => c._id === product.productCategory);
                      const supplier = suppliers.find(s => s._id === product.productSupplier);
                      return (
                        <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <img
                                  className="h-12 w-12 rounded-lg object-cover border"
                                  src={typeof product.productImage === "string" ? product.productImage : "https://via.placeholder.com/50"}
                                  alt={product.productName}
                                  onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/50"; }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.productName ?? "N/A"}</div>
                                <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">{product.productDescription ?? "-"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {category?.categoryName ?? "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {supplier?.supplierName ?? "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.productPrice != null ? `₹${product.productPrice.toFixed(2)}` : "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (product.productStock || 0) > 10 
                                ? "bg-green-100 text-green-800" 
                                : (product.productStock || 0) > 0 
                                  ? "bg-yellow-100 text-yellow-800" 
                                  : "bg-red-100 text-red-800"
                            }`}>
                              {product.productStock != null ? product.productStock : "0"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                onClick={() => handleEdit(product)}
                                title="Edit product"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                                onClick={() => deleteProduct(product._id)}
                                title="Delete product"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Product Modal */}
        {addProduct && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RxCross2 size={24} />
              </button>
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <form onSubmit={submitProduct} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="productName"
                      placeholder="Product Name"
                      value={formData.productName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      name="productPrice"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      value={formData.productPrice}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="productStock"
                      placeholder="0"
                      min="0"
                      value={formData.productStock}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      name="productCategory"
                      value={formData.productCategory}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Supplier *
                    </label>
                    <select
                      name="productSupplier"
                      value={formData.productSupplier}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier._id} value={supplier._id}>
                          {supplier.supplierName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="productDescription"
                      placeholder="Product description..."
                      value={formData.productDescription}
                      onChange={handleChange}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 text-gray-400">
                            <FiUpload className="w-8 h-8 mb-2" />
                            <span className="text-sm">Upload Image</span>
                          </div>
                        )}
                        <input
                          type="file"
                          name="productImage"
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                        />
                      </label>
                      <div className="flex-1">
                        <p className="text-sm text-gray-500">
                          Upload a product image. Supported formats: JPG, PNG, GIF.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading
                      ? "Saving..."
                      : editProduct
                      ? "Update Product"
                      : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Products;