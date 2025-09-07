import React, { useState, useEffect } from "react";
import axios from "axios";

type CustomerType = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type ProductType = {
  _id: string;
  name: string;
  price: number;
  categoryName?: string;
  supplierName?: string;
};

type OrderType = {
  _id: string;
  quantity: number;
  total: number;
  price: number;
  orderDate?: string;
  customer?: CustomerType | null;
  product?: ProductType | null;
  status?: string;
};

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        "http://localhost:5000/order/get/allorders",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.status === 200) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders", error);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`http://localhost:5000/order/delete/${id}`, {
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

  const changeStatusHandler = async (orderId: string, newStatus: string) => {
    try {
      if (window.confirm("Are you sure you want to change the status of this order?")) {
        await axios.put(
          `http://localhost:5000/order/update/status/${orderId}`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("Order status updated successfully");
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status", error);
      alert("Failed to update order status");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={fetchOrders}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order Management</h1>
        <button
          onClick={fetchOrders}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Orders
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-20 w-20 mx-auto text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No orders found
          </h2>
          <p className="text-gray-500 mb-4">
            There are no orders in the system at the moment.
          </p>
          <button
            onClick={fetchOrders}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded-lg inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Check Again
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`transition-all duration-150 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}
                  >
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer?.name || "Unknown Customer"}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[120px]">
                        {order.customer?.email || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.product?.name || "Unknown Product"}
                      </div>
                      {order.product?.categoryName && (
                        <div className="text-xs text-gray-500 mt-1">
                          {order.product.categoryName}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {order.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono">Rs. {order.price.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <span className="font-mono">Rs. {order.total.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${order.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : order.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : order.status === "delivered"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <select
                          className="border border-gray-300 rounded-md py-1.5 px-2 text-xs shadow-sm focus:ring-blue-500 focus:border-blue-500"
                          name="status"
                          defaultValue={order.status}
                          onChange={(e) =>
                            changeStatusHandler(order._id, e.target.value)
                          }
                        >
                          <option value="" disabled>Change Status</option>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 py-1.5 px-2 rounded-md flex items-center justify-center transition-colors text-xs"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;