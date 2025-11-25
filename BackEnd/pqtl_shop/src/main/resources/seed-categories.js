// MongoDB Seed Script for Categories
// Run this script using: mongosh <seed-categories.js
// Or use: mongo your-database-name < seed-categories.js

// Connect to database (adjust connection string as needed)
// use pqtl_shop;

// Categories to insert
const categories = [
  {
    name: "Trái Cây Tươi",
    slug: "trai-cay-tuoi"
  },
  {
    name: "Rau Ăn Hữu Cơ",
    slug: "rau-an-huu-co"
  },
  {
    name: "Củ Quả & Gia Vị",
    slug: "cu-qua-gia-vi"
  },
  {
    name: "Thịt & Trứng Sạch",
    slug: "thit-trung-sach"
  },
  {
    name: "Hải Sản Tươi",
    slug: "hai-san-tuoi"
  },
  {
    name: "Thực Phẩm Khô",
    slug: "thuc-pham-kho"
  }
];

// Insert categories
try {
  const result = db.categories.insertMany(categories);
  print(`Successfully inserted ${result.insertedIds.length} categories`);
  printjson(result);
} catch (error) {
  if (error.code === 11000) {
    print("Some categories already exist. Skipping duplicates.");
  } else {
    print(`Error inserting categories: ${error}`);
  }
}

// Verify inserted categories
print("\nCategories in database:");
db.categories.find().forEach(cat => {
  print(`- ${cat.name} (slug: ${cat.slug})`);
});

