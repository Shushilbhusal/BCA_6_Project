/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
 
} from "chart.js";
import type { ChartOptions} from 'chart.js'
import { Bar, Line, Pie } from "react-chartjs-2";
import { RxCross2 } from "react-icons/rx";
import { FiPlus, FiTrendingUp, FiTrendingDown, FiPieChart, FiBarChart2, FiLoader } from "react-icons/fi";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Type definitions
interface ExpenseData {
  description: string;
  amount: number;
  date: string;
  type: "expense" | "revenue";
}

interface ChartData {
  expensesArr: number[];
  revenueArr: number[];
  profitArr: number[];
  lossArr: number[];
}

interface MonthlyData {
  [key: number]: {
    expenses: number;
    revenue: number;
    profit: number;
    loss: number;
  };
}

function ExpenseTrack() {
  const [formData, setFormData] = useState<ExpenseData>({
    description: "",
    amount: 0,
    date: "",
    type: "expense",
  });
  const [openForm, setOpenForm] = useState(false);
  const [chartData, setChartData] = useState<ChartData>({
    expensesArr: Array(12).fill(0),
    revenueArr: Array(12).fill(0),
    profitArr: Array(12).fill(0),
    lossArr: Array(12).fill(0),
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Chart options
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Financial Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (Rs.)',
        },
      },
    },
  };

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Comparison',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount (Rs.)',
        },
      },
    },
  };

  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Financial Distribution',
      },
    },
  };

  // Fetch monthly data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get<MonthlyData>("http://localhost:5000/expenseTracker/getExpensesByMonth");
      const data = res.data;

      const expensesArr = monthLabels.map((_, i) => data[i]?.expenses || 0);
      const revenueArr = monthLabels.map((_, i) => data[i]?.revenue || 0);
      const profitArr = monthLabels.map((_, i) => data[i]?.profit || 0);
      const lossArr = monthLabels.map((_, i) => data[i]?.loss || 0);

      setChartData({ expensesArr, revenueArr, profitArr, lossArr });
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) || 0 : value,
    }));
  };

  // Validate form
  const validateForm = () => {
    if (formData.amount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }
    
    if (!formData.date) {
      setError("Date is required");
      return false;
    }
    
    setError("");
    return true;
  };

  // Submit new data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      // Convert type to match backend expectation
      const backendType = formData.type === "expense" ? "expenses" : "revenue";
      
      const response = await axios.post(
        "http://localhost:5000/expenseTracker/add", 
        { ...formData, type: backendType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 201) {
        alert("Data added successfully ");
        setFormData({ description: "", amount: 0, date: "", type: "expense" });
        setOpenForm(false);
        fetchData(); // Refresh chart immediately
      }
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals for summary cards and pie chart
  const calculateTotals = () => {
    const totalExpenses = chartData.expensesArr.reduce((sum, val) => sum + val, 0);
    const totalRevenue = chartData.revenueArr.reduce((sum, val) => sum + val, 0);
    const totalProfit = chartData.profitArr.reduce((sum, val) => sum + val, 0);
    const totalLoss = chartData.lossArr.reduce((sum, val) => sum + val, 0);
    
    return { totalExpenses, totalRevenue, totalProfit, totalLoss };
  };

  const { totalExpenses, totalRevenue, totalProfit, totalLoss } = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <FiLoader className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading expense data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Expense Tracker</h1>
        <button
          onClick={() => setOpenForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <FiPlus /> Add Data
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError("")} className="float-right font-bold">×</button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-full">
              <FiTrendingDown className="text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-lg font-semibold">Rs. {totalExpenses.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-full">
              <FiTrendingUp className="text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-lg font-semibold">Rs. {totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-full">
              <FiTrendingUp className="text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Profit</p>
              <p className="text-lg font-semibold">Rs. {totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-full">
              <FiTrendingDown className="text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-500">Total Loss</p>
              <p className="text-lg font-semibold">Rs. {totalLoss.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense/Revenue Modal */}
      {openForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative"
          >
            <button
              type="button"
              onClick={() => {
                setOpenForm(false);
                setError("");
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <RxCross2 size={24} />
            </button>

            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Add Expense or Revenue
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="revenue">Revenue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || ""}
                  placeholder="Amount"
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]} // Prevent future dates
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  placeholder="Description"
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 mt-4 flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                "Add Data"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Charts Section */}
      <div className="space-y-6">
        {/* Line Chart - Large */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center mb-4">
            <FiTrendingUp className="text-indigo-600 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Monthly Trends</h2>
          </div>
          <div className="h-96">
            <Line
              data={{
                labels: monthLabels,
                datasets: [
                  {
                    label: "Expenses",
                    data: chartData.expensesArr,
                    borderColor: "rgba(239, 68, 68, 1)",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                  },
                  {
                    label: "Revenue",
                    data: chartData.revenueArr,
                    borderColor: "rgba(34, 197, 94, 1)",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                  },
                ],
              }}
              options={lineChartOptions}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart - Large */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-4">
              <FiBarChart2 className="text-indigo-600 mr-2 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Monthly Comparison</h2>
            </div>
            <div className="h-96">
              <Bar
                data={{
                  labels: monthLabels,
                  datasets: [
                    {
                      label: "Expenses",
                      data: chartData.expensesArr,
                      backgroundColor: "rgba(239, 68, 68, 0.8)",
                      borderColor: "rgba(239, 68, 68, 1)",
                      borderWidth: 1,
                    },
                    {
                      label: "Revenue",
                      data: chartData.revenueArr,
                      backgroundColor: "rgba(34, 197, 94, 0.8)",
                      borderColor: "rgba(34, 197, 94, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={barChartOptions}
              />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex items-center mb-4">
              <FiPieChart className="text-indigo-600 mr-2 text-xl" />
              <h2 className="text-xl font-semibold text-gray-800">Financial Distribution</h2>
            </div>
            <div className="h-96">
              <Pie
                data={{
                  labels: ["Expenses", "Revenue", "Profit", "Loss"],
                  datasets: [
                    {
                      data: [totalExpenses, totalRevenue, totalProfit, totalLoss],
                      backgroundColor: [
                        "rgba(239, 68, 68, 0.8)",
                        "rgba(34, 197, 94, 0.8)",
                        "rgba(59, 130, 246, 0.8)",
                        "rgba(245, 158, 11, 0.8)",
                      ],
                      borderColor: [
                        "rgba(239, 68, 68, 1)",
                        "rgba(34, 197, 94, 1)",
                        "rgba(59, 130, 246, 1)",
                        "rgba(245, 158, 11, 1)",
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={pieChartOptions}
              />
            </div>
          </div>
        </div>

        {/* Additional Detailed Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex items-center mb-4">
            <FiBarChart2 className="text-indigo-600 mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-gray-800">Profit & Loss Analysis</h2>
          </div>
          <div className="h-96">
            <Bar
              data={{
                labels: monthLabels,
                datasets: [
                  {
                    label: "Profit",
                    data: chartData.profitArr,
                    backgroundColor: "rgba(59, 130, 246, 0.8)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                  },
                  {
                    label: "Loss",
                    data: chartData.lossArr,
                    backgroundColor: "rgba(245, 158, 11, 0.8)",
                    borderColor: "rgba(245, 158, 11, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={barChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseTrack;



