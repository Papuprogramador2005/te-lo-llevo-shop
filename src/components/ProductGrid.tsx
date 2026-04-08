import { products } from "@/data/products";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  category: string;
  searchQuery: string;
}

const ProductGrid = ({ category, searchQuery }: ProductGridProps) => {
  const filtered = products.filter((p) => {
    const matchCategory = category === "Todos" || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <section id="productos" className="container mx-auto px-4 pb-16">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-6">
        {category === "Todos" ? "Todos los productos" : category}
        <span className="text-sm font-normal text-muted-foreground ml-3">
          {filtered.length} productos
        </span>
      </h2>
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {filtered.map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
