import axios from "axios";
import React, { useState, useEffect } from "react";
import { FiSearch, FiBox, FiShoppingCart, FiPackage } from "react-icons/fi";
import type { ProductType } from "./products";

type OrderType = {
  _id: string;
  productId: string;
  quantity: number;
  total: number;
  price: number;
  orderDate?: string;
};

function Orders() {
  const [loading, setLoading] = useState(false);
  const [orderList, setOrderList] = useState<OrderType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductType[]>([]);
  const [userName, setUserName] = useState("");
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/order/get", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.status === 200) {
        console.log("orders", response.data.getorders);
        setOrderList(response.data.getorders || []);
        setProducts(response.data.findProducts || []);
        console.log("response.data.findUsers", response.data.findUsers);
        setUserName(response.data.findUsers.name)
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on product name search
  const filteredOrders = orderList.filter((order) => {
    if (!searchTerm) return true;

    const product = products.find((p) => p._id === order.productId);
    const productName = product ? product.name.toLowerCase() : "";
    return productName.includes(searchTerm.toLowerCase());
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // handle delete

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`http://localhost:5000/order/delete/${id}`,
          
           {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Order deleted successfully");
        fetchOrders();
      } catch (error) {
        console.error("Error deleting order", error);
        alert("Failed to delete order");
      }
    }
  };

  // Format date if available
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Order History</h1>

     <h1 className="text-xl font-semibold text-gray-800">
        welcome, <span className="text-blue-600">{userName}</span>
      </h1>

      {/* Search and Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-500" />
            </div>
            <input
              type="text"
              name="name"
              placeholder="Search by product name..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleChange}
            />
          </div>

          <div className="flex space-x-4">
            <div className="bg-blue-50 px-4 py-2 rounded-lg flex items-center">
              <FiShoppingCart className="text-blue-600 mr-2" />
              <span className="font-semibold">
                {filteredOrders.length} Orders
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <div className="text-green-600 text-xl font-bold">Rs.</div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-xl font-bold text-green-700">
                Rs.
                {filteredOrders
                  .reduce((sum, order) => sum + order.total, 0)
                  .toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FiPackage className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Items</p>
              <p className="text-xl font-bold text-purple-700">
                {filteredOrders.reduce((sum, order) => sum + order.quantity, 0)}
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full mr-4">
              <FiBox className="text-yellow-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Order</p>
              <p className="text-xl font-bold text-yellow-700">
                Rs.
                {filteredOrders.length > 0
                  ? (
                      filteredOrders.reduce(
                        (sum, order) => sum + order.total,
                        0
                      ) / filteredOrders.length
                    ).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Product
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Unit Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                     <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const product = products.find(
                      (p) => p._id === order.productId
                    );
                    return (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product ? product.name : "Unknown Product"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {order.quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Rs.{order.price.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Rs.{order.total.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <FiBox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "No orders match your search."
                : "Get started by placing your first order."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
