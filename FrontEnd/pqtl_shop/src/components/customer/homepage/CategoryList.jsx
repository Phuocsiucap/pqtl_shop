import { useNavigate } from "react-router-dom";

const slugify = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const CategoryList = ({ categories = [] }) => {
  const navigate = useNavigate();

  const handleNavigate = (cat) => {
    const slug = cat.slug || slugify(cat.name);
    navigate(`/category/${slug}`, {
      state: { categoryName: cat.name },
    });
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
      {categories.map((cat, idx) => (
        <button
          key={idx}
          onClick={() => handleNavigate(cat)}
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center group focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <div className="text-4xl mb-2 group-hover:scale-110 transition">{cat.icon}</div>
          <p className="font-semibold text-gray-800">{cat.name}</p>
          <p className="text-xs text-gray-500">{cat.count} sản phẩm</p>
        </button>
      ))}
    </div>
  );
};

export default CategoryList;