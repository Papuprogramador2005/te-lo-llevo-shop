import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import StoreHeader from "@/components/StoreHeader";
import ProductCard from "@/components/ProductCard";
import CartSidebar from "@/components/CartSidebar";
import StoreFooter from "@/components/StoreFooter";
import { products, categories } from "@/data/products";
import { ArrowLeft, LayoutGrid, Apple, Carrot, Package, BookOpen } from "lucide-react";

const categoryMeta: Record<string, { icon: React.ReactNode; emoji: string; description: string; gradient: string }> = {
  Frutas: {
    icon: <Apple size={28} />,
    emoji: "🍎",
    description: "Frutas frescas y de temporada, directas del campo a tu mesa.",
    gradient: "from-red-500/20 to-orange-500/20",
  },
  Verduras: {
    icon: <Carrot size={28} />,
    emoji: "🥦",
    description: "Verduras y hortalizas frescas para una alimentación saludable.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  Abarrotes: {
    icon: <Package size={28} />,
    emoji: "🍚",
    description: "Productos básicos de la despensa para tu hogar.",
    gradient: "from-amber-500/20 to-yellow-500/20",
  },
  Librería: {
    icon: <BookOpen size={28} />,
    emoji: "📓",
    description: "Material escolar y de oficina de la mejor calidad.",
    gradient: "from-blue-500/20 to-indigo-500/20",
  },
};

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const category = categoryName || "";
  const meta = categoryMeta[category];

  const filtered = products.filter((p) => {
    const matchCategory = p.category === category;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1">
        {/* Category Header */}
        <section className={`bg-gradient-to-br ${meta?.gradient || "from-primary/10 to-accent/10"} py-10 md:py-16`}>
          <div className="container mx-auto px-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4">
              <ArrowLeft size={16} /> Volver al inicio
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{meta?.emoji || "📦"}</span>
              <div>
                <h1 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground">{category}</h1>
                <p className="text-muted-foreground mt-1">{meta?.description || "Explora nuestros productos."}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Subcategory Nav */}
        <section className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.filter(c => c !== "Todos").map((cat) => (
              <Link
                key={cat}
                to={`/categoria/${cat}`}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  cat === category
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-6">{filtered.length} productos encontrados</p>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium">No se encontraron productos en esta categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((product, i) => (
                <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <StoreFooter />
      <CartSidebar />
    </div>
  );
};

export default CategoryPage;
