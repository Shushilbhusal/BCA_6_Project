import { AiFillProduct } from "react-icons/ai";
import { CgProfile } from "react-icons/cg";
import {
  FaCartArrowDown,
  FaHome,
  FaUsers,
  FaCashRegister,
} from "react-icons/fa";
import { RiCaravanLine, RiLogoutCircleRFill } from "react-icons/ri";
import { TbCategoryFilled } from "react-icons/tb";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaHome />,
      isParent: true,
    },
    {
      name: "Categories",
      path: "/admin/dashboard/categories",
      icon: <TbCategoryFilled />,
      isParent: false,
    },
    {
      name: "Products",
      path: "/admin/dashboard/products",
      icon: <AiFillProduct />,
      isParent: false,
    },
    {
      name: "Suppliers",
      path: "/admin/dashboard/suppliers",
      icon: <RiCaravanLine />,
      isParent: false,
    },
    {
      name: "Orders",
      path: "/admin/dashboard/orders",
      icon: <FaCartArrowDown />,
      isParent: false,
    },
    {
      name: "Sales & Billing",
      path: "/admin/dashboard/sales",
      icon: <FaCashRegister />,
      isParent: false,
    },
    // {
    //   name: "Reports & Analytics",
    //   path: "/admin/dashboard/reports",
    //   icon: <FaChartBar />,
    //   isParent: false,
    // },

    {
      name: "Users",
      path: "/admin/dashboard/users",
      icon: <FaUsers />,
      isParent: false,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <CgProfile />,
      isParent: false,
    },
    {
      name: "Logout",
      path: "/logout",
      icon: <RiLogoutCircleRFill />,
      isParent: false,
    },
  ];

  const { user } = useAuth();

  const customerItems = [
    {
      name: "Products",
      path: "/customer/dashboard/products",
      icon: <AiFillProduct />,
      isParent: true,
    },
    {
      name: "Orders",
      path: "/customer/dashboard/orders",
      icon: <FaCartArrowDown />,
      isParent: false,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <CgProfile />,
      isParent: false,
    },
    {
      name: "Logout",
      path: "/logout",
      icon: <RiLogoutCircleRFill />,
      isParent: false,
    },
  ];

  const [sidebar, setSidebar] = useState(customerItems);

  useEffect(() => {
    if (user && user.role === "admin") {
      setSidebar(menuItems);
    }
  }, []);

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-indigo-50 shadow-xl flex flex-col border-r border-gray-200">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-indigo-700 tracking-wide flex items-center">
          Department Store Management System
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto pt-6 px-4">
        <ul className="space-y-3">
          {sidebar.map((item, index) => {
            const isLogout = item.name === "Logout";
            return (
              <li key={index}>
                <NavLink
                  to={item.path}
                  end={item.isParent}
                  className={({ isActive }) =>
                    (isActive
                      ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-indigo-700 border-l-4 border-indigo-500 shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-gradient-to-r from-blue-50 to-indigo-50 hover:text-indigo-600") +
                    " flex items-center p-3 rounded-lg transition-all duration-300 group " +
                    (isLogout ? "mt-10 border-t border-gray-200 pt-5" : "")
                  }
                >
                  <span className="text-xl mr-3 group-hover:scale-110 transition-transform duration-300 text-indigo-500">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                  <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-indigo-400">
                    →
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}

      <div className="p-4 text-center text-gray-400 text-xs bg-white border-t border-gray-200">
        © {new Date().getFullYear()} Department Store. All rights reserved.
      </div>
    </div>
  );
}

export default Sidebar;
