import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { RxCross2 } from "react-icons/rx";
import { FiEdit, FiTrash2, FiPlus, FiSearch, FiChevronDown, FiChevronUp } from "react-icons/fi";

export type Supplier = {
  _id: string;
  supplierName: string;
  supplierEmail: string;
  supplierContact: string;
  supplierAddress: string;
  categoryName: string;
  supplierStatus: string;
};

function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);

  // Form fields
  const [supplierName, setSupplierName] = useState("");
  const [supplierEmail, setSupplierEmail] = useState("");
  const [supplierContact, setSupplierContact] = useState("");
  const [supplierAddress, setSupplierAddress] = useState("");
  const [supplierStatus, setSupplierStatus] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);

  // 🔹 API base
  const API_URL = "http://localhost:5000/supplier";

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/get`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      
      if (res.status === 200) {
        // Access the data from res.data.data as per your API response
        setSuppliers(res.data.supplier)
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      setSuppliers([]);
    
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Sort suppliers
  const sortedSuppliers = React.useMemo(() => {
    if (!sortConfig) return suppliers;
    
    return [...suppliers].sort((a, b) => {
      if (a[sortConfig.key as keyof Supplier] < b[sortConfig.key as keyof Supplier]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key as keyof Supplier] > b[sortConfig.key as keyof Supplier]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  }, [suppliers, sortConfig]);

  // Request sort
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filtered suppliers
  const filteredSuppliers = sortedSuppliers.filter((s) =>
    [s.supplierName, s.supplierEmail, s.categoryName, s.supplierAddress]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Reset form
  const resetForm = () => {
    setSupplierName("");
    setSupplierEmail("");
    setSupplierContact("");
    setSupplierAddress("");
    setSupplierStatus("");
    setCategoryName("");
    setEditSupplier(null);
  };

  // Open form
  const openForm = (supplier?: Supplier) => {
    if (supplier) {
      setEditSupplier(supplier);
      setSupplierName(supplier.supplierName);
      setSupplierEmail(supplier.supplierEmail);
      setSupplierContact(supplier.supplierContact);
      setSupplierAddress(supplier.supplierAddress);
      setSupplierStatus(supplier.supplierStatus);
      setCategoryName(supplier.categoryName);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  // Close form
  const closeForm = () => {
    resetForm();
    setIsFormOpen(false);
  };

  // Submit form (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      supplierName,
      supplierEmail,
      supplierContact,
      supplierAddress,
      supplierStatus,
      categoryName,
    };

    try {
      let res;
      if (editSupplier) {
        // update
        res = await axios.put(`${API_URL}/update/${editSupplier._id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 200) {
          alert("Supplier updated successfully");
        }
      } else {
        // create
        res = await axios.post(`${API_URL}/create`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (res.status === 201) {
          alert("Supplier added successfully");
        }
      }
      closeForm();
      fetchSuppliers();
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosErr = err as AxiosError<any>;
      setError(axiosErr.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Delete supplier
  const handleDeleteSupplier = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      setLoading(true);
      const res = await axios.delete(`${API_URL}/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.status === 201) {
        alert("Supplier deleted successfully");
        fetchSuppliers();
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete supplier");
    } finally {
      setLoading(false);
    }
  };

  // Table headers with sorting
  const tableHeaders = [
    { key: "supplierName", label: "Name" },
    { key: "supplierAddress", label: "Address" },
    { key: "supplierEmail", label: "Email" },
    { key: "supplierContact", label: "Contact" },
    { key: "categoryName", label: "Category" },
    { key: "supplierStatus", label: "Status" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                Suppliers
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                Manage your suppliers and their details
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => openForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Supplier
              </button>
            </div>
          </div>

          {/* Supplier Table */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-1">
                No suppliers found
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by adding your first supplier
              </p>
              <button
                onClick={() => openForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg inline-flex items-center transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Supplier
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      S.N
                    </th>
                    {tableHeaders.map((header) => (
                      <th
                        key={header.key}
                        className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort(header.key)}
                      >
                        <div className="flex items-center">
                          {header.label}
                          {sortConfig && sortConfig.key === header.key && (
                            sortConfig.direction === 'ascending' ? 
                            <FiChevronUp className="ml-1" /> : 
                            <FiChevronDown className="ml-1" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((s, i) => (
                    <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {i + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {s.supplierName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {s.supplierAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {s.supplierEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {s.supplierContact}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {s.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            s.supplierStatus === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {s.supplierStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            onClick={() => openForm(s)}
                            title="Edit supplier"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            onClick={() => handleDeleteSupplier(s._id)}
                            title="Delete supplier"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-200 bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl relative">
            <button
              onClick={closeForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <RxCross2 size={24} />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              {editSupplier ? "Edit Supplier" : "Add New Supplier"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Supplier Name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="supplier@example.com"
                  value={supplierEmail}
                  onChange={(e) => setSupplierEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  placeholder="Phone number"
                  value={supplierContact}
                  onChange={(e) => setSupplierContact(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Full address"
                  value={supplierAddress}
                  onChange={(e) => setSupplierAddress(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Category name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={supplierStatus}
                  onChange={(e) => setSupplierStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
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
                    : editSupplier
                    ? "Update Supplier"
                    : "Add Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Suppliers;