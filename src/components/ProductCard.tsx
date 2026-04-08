import { Plus, Check } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group bg-card rounded-xl border border-border p-4 shadow-product hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Emoji Icon */}
      <div className="flex items-center justify-center h-24 md:h-28 text-5xl md:text-6xl mb-3 bg-muted rounded-lg group-hover:scale-110 transition-transform duration-300">
        {product.image}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          {product.category}
        </span>
        <h3 className="font-heading font-semibold text-sm text-foreground leading-snug">
          {product.name}
        </h3>
        <div className="flex items-end justify-between pt-1">
          <div>
            <span className="text-lg font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <span className="text-xs text-muted-foreground ml-1">/{product.unit}</span>
          </div>
          <button
            onClick={handleAdd}
            className={`p-2 rounded-full transition-all duration-300 ${
              added
                ? "bg-success text-primary-foreground scale-110"
                : "bg-primary text-primary-foreground hover:opacity-90 hover:scale-105"
            }`}
          >
            {added ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
