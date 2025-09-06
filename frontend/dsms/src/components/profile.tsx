/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import React, { useEffect, useState } from "react";

type UserProfileType = {
  _id: string;
  name: string;
  email: string;
  address: string;
  phone: number;
  password?: string;
};

function Profile() {
  const [userData, setUserData] = useState<UserProfileType | null>(null);
  const [editProfile, setEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    address: string;
    phone: number;
    password?: string;
  }>({
    name: "",
    email: "",
    address: "",
    phone: 0,
    password: "",
  });

  // handle Edit profile
  const handleFormData = (user: UserProfileType) => {
    if (!user) {
      return null;
    }
    setFormData({
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      password: "",
    });
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/user/getprofile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const user = response.data.userWithoutPassword;
        console.log("User Profile:", user);
        setUserData(user);
        handleFormData(user); // Pass data directly if needed
      }
    } catch (error: any) {
      if (error.response) {
        alert(
          `Error: ${
            error.response.data.message || "Failed to fetch profile data"
          }`
        );
      } else {
        alert("Network error or server not responding");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create update data without empty password field
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      const response = await axios.put(
        `http://localhost:5000/user/update/${userData?._id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        alert("Profile updated successfully");
        setEditProfile(false);
        fetchUserProfile(); // Refresh the profile data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        <button
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
          onClick={() => setEditProfile(true)}
        >
          Edit Profile
        </button>
      </div>

      {userData && (
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <div className="flex mb-4">
            <label className="font-semibold w-32 text-gray-700">Name:</label>
            <span className="text-gray-800">{userData.name}</span>
          </div>
          <div className="flex mb-4">
            <label className="font-semibold w-32 text-gray-700">Email:</label>
            <span className="text-gray-800">{userData.email}</span>
          </div>
          <div className="flex mb-4">
            <label className="font-semibold w-32 text-gray-700">Address:</label>
            <span className="text-gray-800">{userData.address}</span>
          </div>
          <div className="flex">
            <label className="font-semibold w-32 text-gray-700">Phone:</label>
            <span className="text-gray-800">{userData.phone}</span>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {editProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Profile
              </h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setEditProfile(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Phone
                </label>
                <input
                  type="number"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium mb-2"
                >
                  New Password (optional)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditProfile(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
