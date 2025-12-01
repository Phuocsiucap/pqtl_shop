import React, { useEffect, useState } from "react";
import { FaEye, FaTrashAlt, FaEdit, FaSort, FaSortUp, FaSortDown, FaFilter, FaSearch } from "react-icons/fa";
import UserDetailModal from "./UserDetailModal .jsx"
import UserEditModal from "./UserEditModal.jsx"
import { request1 } from "../../../utils/request.js";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken.js";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Filter states
  const [selectedRole, setSelectedRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("lastLogin"); // lastLogin, createdAt, name
  const [sortOrder, setSortOrder] = useState("desc"); // asc, desc

  const roleList = [
    { key: "all", label: "Tất cả", color: "bg-gray-500" },
    { key: "USER", label: "Người dùng", color: "bg-blue-500" },
    { key: "ADMIN", label: "Admin", color: "bg-red-500" },
  ];

  // Filter and sort users
  const filterAndSortUsers = () => {
    let result = [...users];
    
    // Filter by role
    if (selectedRole !== "all") {
      result = result.filter(user => user.role === selectedRole);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(user => 
        user.fullName?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.phone?.includes(query)
      );
    }
    
    // Sort
    result.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "lastLogin":
          compareValue = new Date(a.lastLogin || 0) - new Date(b.lastLogin || 0);
          break;
        case "createdAt":
          compareValue = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
        case "name":
          compareValue = (a.fullName || "").localeCompare(b.fullName || "");
          break;
        default:
          break;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });
    
    setFilteredUsers(result);
    setCurrentPage(1);
  };

  useEffect(() => {
    filterAndSortUsers();
  }, [users, selectedRole, searchQuery, sortBy, sortOrder]);

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const editUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const response = await request1.put(`v1/admin/users/${userId}/`, updates, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      console.log("User updated:", response);
      
      // Cập nhật local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      alert("Cập nhật thành công!");
    } catch (e) {
      console.log("Lỗi cập nhật:", e);
      if (e.response?.status === 403) {
        alert("Bạn không có quyền thực hiện thao tác này!");
      } else {
        alert("Cập nhật thất bại!");
      }
    }
  };

  const deleteUser = async(id) => {
    const userToDelete = users.find(u => u.id === id);
    if (userToDelete?.role === "ADMIN") {
      alert("Không thể xóa tài khoản Admin!");
      return;
    }
    
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa người dùng này?");
    if (confirmDelete) {
      try {
        const response = await request1.delete(`v1/admin/users/${id}/`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(response)
        setUsers(users.filter((user) => user.id !== id));
        alert("Xóa thành công")
      } catch (e) {
        alert("Xóa thất bại")
        console.log("Lỗi ", e);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === "asc" ? <FaSortUp className="text-blue-500" /> : <FaSortDown className="text-blue-500" />;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "Chưa đăng nhập";
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getRoleBadge = (role) => {
    const isAdmin = role === "ADMIN";
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      }`}>
        {isAdmin ? "Admin" : "User"}
      </span>
    );
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("v1/admin/users/", {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        console.log(response)
        setUsers(response.data);
      } catch (e) {
        console.log("Lỗi ", e);
      }
    };
    fetch();
  }, []);

  // Lấy danh sách người dùng hiển thị theo trang
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Tính số trang
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Count users by role
  const userStats = {
    all: users.length,
    USER: users.filter(u => u.role === "USER").length,
    ADMIN: users.filter(u => u.role === "ADMIN").length,
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Danh sách người dùng</h2>
      
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        {/* Role Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {roleList.map((role) => (
            <button
              key={role.key}
              onClick={() => setSelectedRole(role.key)}
              className={`px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                selectedRole === role.key
                  ? `${role.color} text-white shadow-lg`
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {role.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedRole === role.key ? "bg-white/20" : "bg-gray-200"
              }`}>
                {userStats[role.key]}
              </span>
            </button>
          ))}
        </div>
        
        {/* Search */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-500" />
            <span className="font-medium text-gray-700">Tìm kiếm:</span>
          </div>
          
          <div className="flex-1 min-w-[200px] relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lastLogin">Lần đăng nhập cuối</option>
              <option value="createdAt">Ngày tạo</option>
              <option value="name">Tên</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />}
            </button>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          Hiển thị <span className="font-semibold text-blue-600">{filteredUsers.length}</span> / {users.length} người dùng
        </div>
      </div>

      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Tên người dùng</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Email</th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase">Vai trò</th>
              <th 
                className="px-6 py-4 text-center text-sm font-semibold uppercase cursor-pointer hover:bg-blue-600"
                onClick={() => handleSort("lastLogin")}
              >
                <div className="flex items-center justify-center gap-2">
                  Đăng nhập cuối
                  {getSortIcon("lastLogin")}
                </div>
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-gray-50">
            {currentUsers.map((user, index) => (
              <tr
                key={index}
                className="hover:bg-gray-100 transition-all duration-150"
              >
                <td className="px-6 py-4 text-gray-800 text-sm font-medium">{user.fullName}</td>
                <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-center">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 text-center text-gray-600 text-sm">
                  {formatDateTime(user.lastLogin)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => viewUserDetails(user)}
                    className="text-blue-600 hover:text-blue-800 transition-all duration-200 mx-2"
                    title="Xem chi tiết"
                  >
                    <FaEye className="inline-block text-lg" />
                  </button>
                  <button
                    onClick={() => editUser(user)}
                    className="text-green-600 hover:text-green-800 transition-all duration-200 mx-2"
                    title="Chỉnh sửa"
                  >
                    <FaEdit className="inline-block text-lg" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className={`transition-all duration-200 mx-2 ${
                      user.role === "ADMIN" 
                        ? "text-gray-400 cursor-not-allowed" 
                        : "text-red-600 hover:text-red-800"
                    }`}
                    disabled={user.role === "ADMIN"}
                    title={user.role === "ADMIN" ? "Không thể xóa Admin" : "Xóa"}
                  >
                    <FaTrashAlt className="inline-block text-lg" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
              

      {/* Phân trang */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-full ${
            currentPage === 1
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-full ${
              currentPage === index + 1
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-full ${
            currentPage === totalPages
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>

      {isModalOpen && selectedUser && (
        <UserDetailModal user={selectedUser} closeModal={closeModal} />
      )}
      
      {isEditModalOpen && selectedUser && (
        <UserEditModal 
          user={selectedUser} 
          closeModal={closeEditModal}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
};

export default UserList;  
