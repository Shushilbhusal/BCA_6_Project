import axios from "axios";
import React, { useEffect, useState } from "react";
import type { Category } from "./categories";
import type { Supplier } from "./suppliers";
import { RxCross2 } from "react-icons/rx";
import { FiEdit, FiTrash2 } from "react-icons/fi";

interface ProductForm {
  _id?: string;
  productName: string;
  productPrice: number;
  productStock: number;
  productCategory: string;
  productSupplier: string;
  productDescription: string;
  productImage: File | null | string;
}

function Products() {
  const [addProduct, setAddProduct] = useState(false);
  const [products, setProducts] = useState<ProductForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [formData, setFormData] = useState<ProductForm>({
    productName: "",
    productPrice: 0,
    productStock: 0,
    productCategory: "",
    productSupplier: "",
    productDescription: "",
    productImage: null,
  });

  // Handle form inputs
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = event.target;
    const { name, value, type } = target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "file" && target instanceof HTMLInputElement && target.files
          ? target.files[0] // get first file
          : name === "productPrice" || name === "productStock"
          ? Number(value)
          : value,
    }));
  };

  // Reset form
  const resetForm = () => ({
    productName: "",
    productPrice: 0,
    productStock: 0,
    productCategoryId: "",
    productSupplierId: "",
    productDescription: "",
    productImage: null,
    productStatus: "",
  });

  // Add product
  const handleAddProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = new FormData();
      data.append("productName", formData.productName);
      data.append("productPrice", formData.productPrice.toString());
      data.append("productStock", formData.productStock.toString());
      data.append("productCategory", formData.productCategory);
      data.append("productSupplier", formData.productSupplier);
      data.append("productDescription", formData.productDescription);
      if (formData.productImage) {
        data.append("productImage", formData.productImage);
      }

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
        console.log("Product added successfully");
        alert("Product added successfully");
        fetchProducts();
        resetForm();
        setAddProduct(false);
      }
    } catch (error) {
      console.error("Error adding product:", error);
      setError("Error adding product");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories and suppliers
  const fetchData = async () => {
    try {
      const categorySuppliers = await axios.get(
        "http://localhost:5000/product/get",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (categorySuppliers.status === 200) {
        setCategories(categorySuppliers.data.categories);
        setSuppliers(categorySuppliers.data.suppliers);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch All Products

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("http://localhost:5000/product/getAll");
      if (response.status === 200) {
        setProducts(response.data.products);
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  // delete Product
  const deleteProduct = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.delete(
        `http://localhost:5000/product/delete/:${id}`
      );
      if (response.status === 200) {
        alert("product deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <input
        type="text"
        placeholder="Search Product ..."
        className="border p-2 rounded mr-2"
      />
      <button
        onClick={() => setAddProduct(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Add Product
      </button>

      {addProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96 relative">
            <button
              onClick={() => setAddProduct(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
            >
              <RxCross2 size={20} />
            </button>

            <h2 className="text-xl font-semibold mb-4">Add New Product</h2>

            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              className="w-full border p-2 rounded mb-3"
              value={formData.productName}
              onChange={handleChange}
            />

            <label>Product Price</label>
            <input
              type="number"
              name="productPrice"
              className="w-full border p-2 rounded mb-3"
              value={formData.productPrice}
              onChange={handleChange}
            />

            <label>Product Stock</label>
            <input
              type="number"
              name="productStock"
              className="w-full border p-2 rounded mb-3"
              value={formData.productStock}
              onChange={handleChange}
            />

            <label>Product Category</label>
            <select
              name="productCategoryId"
              className="w-full border p-2 rounded mb-3"
              value={formData.productCategory}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>

            <label>Product Supplier</label>
            <select
              name="productSupplierId"
              className="w-full border p-2 rounded mb-3"
              value={formData.productSupplier}
              onChange={handleChange}
            >
              <option value="" disabled>
                Select Supplier
              </option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup._id}>
                  {sup.supplierName}
                </option>
              ))}
            </select>

            <label>Product Description</label>
            <textarea
              name="productDescription"
              className="w-full border p-2 rounded mb-3"
              value={formData.productDescription}
              onChange={handleChange}
            />

            <label>Product Image</label>
            <input
              type="file"
              name="productImage"
              className="w-full border p-2 rounded mb-3"
              onChange={handleChange}
            />

            <button
              className="w-full bg-green-600 text-white py-2 rounded mt-3"
              onClick={handleAddProduct}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Product"}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div>
          <h1>not any products</h1>
          <button
            className="w-full bg-green-600 text-white py-2 rounded mt-3"
            onClick={handleAddProduct}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </div>
      ) : (
        <div>
          <table>
            <thead>
              <tr>
                <th>S.N</th>
                <th> Name</th>
                <th> Price</th>
                <th>Categoreis</th>
                <th>Suppliers</th>
                <th>Description</th>
                <th>Stock</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                return (
                  <tr key={product._id}>
                    <td>{index + 1}</td>
                    <td>{product.productName}</td>
                    <td>{product.productPrice}</td>
                    <td>{product.productCategory}</td>
                    <td>{product.productSupplier}</td>
                    <td>{product.productDescription}</td>
                    <td>{product.productStock}</td>
                    <img src={product.productImage as string} alt="" />
                    <td>
                      <button>update</button> <button>delete</button>
                    </td>
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                      <FiEdit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Products;
