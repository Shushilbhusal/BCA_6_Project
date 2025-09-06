import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Root from "./components/root";
import Login from "./components/login";
import { ProtectedRoutes } from "./utils/protectedRoute";
import Dashboard from "./components/dashboard";
import Categories from "./components/categories";
import Products from "./components/products";
import Suppliers from "./components/suppliers";
import Orders from "./components/orders";
import Users from "./components/users";
import Profile from "./components/profile";
import Sales from "./components/sales";
import Logout from "./components/logout";
import CustomerProduct from "./components/customerProduct";
import SummaryDashboard from "./components/summaryDashboard";
import OrderAdmin from "./components/orderAdmin";
import EmployeeSummaryDashboard from "./components/employeeSummaryDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />

        {/* Logout accessible to all logged-in users */}
        <Route
          path="/logout"
          element={
            <ProtectedRoutes requiredRole={["admin", "employee", "customer"]}>
              <Logout />
            </ProtectedRoutes>
          }
        />

        {/* --------------------------- Customer --------------------------- */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoutes requiredRole={["customer"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<CustomerProduct />} />
          <Route path="products" element={<CustomerProduct />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* --------------------------- Admin --------------------------- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoutes requiredRole={["admin"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<SummaryDashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="orders" element={<OrderAdmin />} />
          <Route path="users" element={<Users />} />
          <Route path="sales" element={<Sales />} />
        </Route>

        {/* --------------------------- Employee --------------------------- */}
        <Route
          path="/employee/dashboard"
          element={
            <ProtectedRoutes requiredRole={["employee"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<EmployeeSummaryDashboard />} />

          {/* Products and Sales shared with admin */}
          <Route
            path="products"
            element={
              <ProtectedRoutes requiredRole={["admin", "employee"]}>
                <Products />
              </ProtectedRoutes>
            }
          />
          <Route
            path="sales"
            element={
              <ProtectedRoutes requiredRole={["admin", "employee"]}>
                <Sales />
              </ProtectedRoutes>
            }
          />
          <Route path="orders" element={<OrderAdmin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
