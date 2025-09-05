import axios from "axios";
import React, { useState, useEffect } from "react";
import { RxCross2 } from "react-icons/rx";

// Define Product type based on your backend
type Product = {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
  categoryName: string;
};

function CustomerProduct() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [orderData, setOrderData] = useState({
    productId: "",
    productName: "",
    quantity: 1,
    total: 0,
    stock: 0,
    price: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setOrderLoading(true);
      const response = await axios.post(
        "http://localhost:5000/order/create",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Order placed successfully");
        setOrderData({
          productId: "",
          productName: "",
          quantity: 1,
          total: 0,
          stock: 0,
          price: 0,
        });
        setOpenModal(false);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      return;
    }
    
    if (newQuantity > orderData.stock) {
      alert("Out of stock");
      return;
    }
    
    const newTotal = newQuantity * orderData.price;
    
    setOrderData({
      ...orderData,
      quantity: newQuantity,
      total: newTotal,
    });
  };

  const handleOrderClick = (product: Product) => {
    setOrderData({
      productId: product._id,
      productName: product.name,
      quantity: 1,
      total: product.price,
      stock: product.stock,
      price: product.price,
    });
    setOpenModal(true);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/product/getAllProducts",
         {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setProductList(response.data.products);

        // Get unique categories
        const uniqueCategories: string[] = Array.from(
          new Set(
            response.data.products.map(
              (product: Product) => product.categoryName
            )
          )
        );
        setCategories(uniqueCategories);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search term and selected category
  const filteredProducts = productList.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryName === selectedCategory : true;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-700">Our Products</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center p-4 bg-blue-50 rounded-lg shadow">
        <div className="w-full md:w-1/3">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <select
            id="category"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option value={cat} key={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/3">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
          <input
            id="search"
            type="text"
            placeholder="Search by name or description..."
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Products grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-48 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{product.categoryName}</p>
                <p className="text-gray-700 mb-4 line-clamp-2">{product.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </div>
                
                <button 
                  onClick={() => handleOrderClick(product)}
                  disabled={product.stock === 0}
                  className={`w-full py-2 px-4 rounded-md font-medium ${product.stock > 0 ? 
                    'bg-blue-600 text-white hover:bg-blue-700' : 
                    'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">No products found. Try adjusting your search.</p>
        </div>
      )}

      {/* Order Modal */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">Place Your Order</h2>
              <button 
                onClick={() => setOpenModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <RxCross2 size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{orderData.productName}</h3>
                <p className="text-gray-600">Price: ${orderData.price.toFixed(2)}</p>
                <p className="text-gray-600">Available: {orderData.stock}</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  max={orderData.stock}
                  value={orderData.quantity}
                  onChange={handleQuantityChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6 p-3 bg-blue-50 rounded-md">
                <p className="text-lg font-semibold text-blue-800">
                  Total: ${orderData.total.toFixed(2)}
                </p>
              </div>
              
              <button
                type="submit"
                disabled={orderLoading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {orderLoading ? 'Processing...' : 'Confirm Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerProduct;