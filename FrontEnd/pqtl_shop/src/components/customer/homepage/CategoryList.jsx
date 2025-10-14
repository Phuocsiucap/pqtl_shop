const CategoryList = ({ categories }) => (
  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
    {categories.map((cat, idx) => (
      <button key={idx} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center group">
        <div className="text-4xl mb-2 group-hover:scale-110 transition">{cat.icon}</div>
        <p className="font-semibold text-gray-800">{cat.name}</p>
        <p className="text-xs text-gray-500">{cat.count} sản phẩm</p>
      </button>
    ))}
  </div>
);
export default CategoryList;