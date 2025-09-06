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
import Reports from "./components/reports";
import Sales from "./components/sales";
import Employee from "./components/employee";
import Logout from "./components/logout";
import CustomerProduct from "./components/customerProduct";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
        <Route
          path="/logout"
          element={
            <ProtectedRoutes requiredRole={["admin", "customer", "employee"]}>
              <Logout />
            </ProtectedRoutes>
          }
        />

        {/* -----------------------------------Customer------------------------------------------------- */}
        <Route path="/customer/dashboard" element={<Dashboard />}>
          <Route
            path="/customer/dashboard/products"
            index
            element={<CustomerProduct />}
          />
          <Route path="/customer/dashboard/orders" index element={<Orders />} />
        </Route>

        {/*------------------------------ Admin with Sidebar and dashboard section started----------------*/}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoutes requiredRole={["admin"]}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route path="categories" element={<Categories />} />
          <Route path="products" element={<Products />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="sales" element={<Sales />} />
          <Route path="employees" element={<Employee />} />
        </Route>

        {/* -----------------------------Admin with Sidebar and dashboard section completed-------------------*/}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
