import React, { useEffect, useState } from "react";
import { FaEye, FaTrashAlt } from "react-icons/fa";
import UserDetailModal from "./UserDetailModal .jsx"
import { request1 } from "../../../utils/request.js";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken.js";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const deleteUser = async(id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa người dùng này?");
    if (confirmDelete) {
      try {
        const response = await request1.delete(`admin/users/${id}/`, {
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

  useEffect(() => {
    const fetch = async () => {
      try {
        const response = await request1.get("admin/users/", {
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
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  // Tính số trang
  const totalPages = Math.ceil(users.length / usersPerPage);

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Danh sách người dùng</h2>
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Tên người dùng</th>
              <th className="px-6 py-4 text-left text-sm font-semibold uppercase">Email</th>
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
                  <button
                    onClick={() => viewUserDetails(user)}
                    className="text-blue-600 hover:text-blue-800 transition-all duration-200 mx-2"
                  >
                    <FaEye className="inline-block text-lg" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:text-red-800 transition-all duration-200 mx-2"
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
    </div>
  );
};

export default UserList;  
