import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Product {
  _id: string;
  name: string;
  category: string;
  size?: string;
  price: number;
}

export default function ProductSearch() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["product-search", query],
    queryFn: async () => {
      if (!query) return [];
      const res = await axios.get(`/api/products/search?query=${query}`);
      return res.data;
    },
    enabled: !!query,
  });

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <input
        className="w-full p-2 border border-gray-300 rounded"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for groceries..."
      />
      {isLoading && <div className="mt-2 text-sm text-gray-500">Searching...</div>}
      {!isLoading && data?.length > 0 && (
        <ul className="bg-white shadow border rounded mt-2 max-h-60 overflow-y-auto">
          {data.map((product: Product) => (
            <li
              key={product._id}
              onClick={() => {
                setSelected([...selected, product]);
                setQuery(""); // Clear search
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {product.name} {product.size ? `- ${product.size}` : ""} (${product.price.toFixed(2)})
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="mt-4">
          <h2 className="font-semibold mb-1">Your Grocery List:</h2>
          <ul className="list-disc list-inside text-sm">
            {selected.map((item) => (
              <li key={item._id}>
                {item.name} {item.size ? `- ${item.size}` : ""} (${item.price.toFixed(2)})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
