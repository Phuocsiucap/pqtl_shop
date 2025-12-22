import React, { useEffect, useState } from "react";
import { FaEdit, FaTrashAlt, FaPlus, FaSearch } from "react-icons/fa";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const access_token = getCSRFTokenFromCookie("access_token_admin");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await request1.get("v1/categories/", {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setCategories(response.data || []);
    } catch (e) {
      console.log("Lỗi khi tải danh mục:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories
  const filteredCategories = categories.filter((cat) =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal for adding
  const openAddModal = () => {
    setModalMode("add");
    setCategoryName("");
    setError("");
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (category) => {
    setModalMode("edit");
    setCategoryName(category.name);
    setError("");
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCategoryName("");
    setError("");
    setSelectedCategory(null);
  };

  // Handle save (add or edit)
  const handleSave = async () => {
    if (!categoryName.trim()) {
      setError("Tên danh mục không được để trống");
      return;
    }

    try {
      if (modalMode === "add") {
        await request1.post(
          "v1/categories/",
          { name: categoryName.trim() },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        alert("Thêm danh mục thành công!");
      } else {
        await request1.put(
          `v1/categories/${selectedCategory.id}`,
          { name: categoryName.trim() },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        alert("Cập nhật danh mục thành công!");
      }
      closeModal();
      fetchCategories();
    } catch (e) {
      console.log("Lỗi:", e);
      const errorMsg = e.response?.data?.error || "Có lỗi xảy ra";
      setError(errorMsg);
    }
  };

  // Handle delete
  const handleDelete = async (category) => {
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}"?\n\nLưu ý: Các sản phẩm thuộc danh mục này sẽ không bị xóa nhưng sẽ không còn danh mục.`
    );

    if (confirmDelete) {
      try {
        await request1.delete(`v1/categories/${category.id}`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });
        alert("Xóa danh mục thành công!");
        fetchCategories();
      } catch (e) {
        console.log("Lỗi khi xóa:", e);
        alert("Xóa danh mục thất bại");
      }
    }
  };

  return (
    <div className="p-6 w-full font-medium">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Quản lý danh mục ({filteredCategories.length})
        </h2>
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm danh mục..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Add button */}
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <FaPlus /> Thêm danh mục
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
        <table className="min-w-full table-auto border-collapse">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="px-6 py-3 text-left">STT</th>
              <th className="px-6 py-3 text-left">Tên danh mục</th>
              <th className="px-6 py-3 text-left">Slug</th>
              <th className="px-6 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : filteredCategories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  Không có danh mục nào
                </td>
              </tr>
            ) : (
              filteredCategories.map((category, index) => (
                <tr
                  key={category.id}
                  className={`border-b hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4 text-gray-500">{category.slug}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(category)}
                        className="text-yellow-500 hover:text-yellow-700 p-2"
                        title="Chỉnh sửa"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Xóa"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[450px]">
            <h3 className="text-xl font-semibold mb-4">
              {modalMode === "add" ? "Thêm danh mục mới" : "Chỉnh sửa danh mục"}
            </h3>

            <div className="mb-4">
              <label className="block text-gray-600 mb-2">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => {
                  setCategoryName(e.target.value);
                  setError("");
                }}
                placeholder="Nhập tên danh mục..."
                className={`w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  error ? "border-red-500" : "border-gray-300"
                }`}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-400 text-white px-6 py-2 rounded-md hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                {modalMode === "add" ? "Thêm" : "Cập nhật"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
