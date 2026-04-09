import { Link } from "react-router-dom";
import { Apple, Carrot, Package, BookOpen, Coffee, ArrowRight } from "lucide-react";
import { products } from "@/data/products";

const categoryData = [
  { name: "Frutas", icon: <Apple size={24} />, emoji: "🍎🍌🍊🍇🍓🍍", color: "from-red-500/10 to-orange-500/10", border: "border-red-200" },
  { name: "Verduras", icon: <Carrot size={24} />, emoji: "🍅🥕🥦🥬🧅🥔", color: "from-green-500/10 to-emerald-500/10", border: "border-green-200" },
  { name: "Abarrotes", icon: <Package size={24} />, emoji: "🍚🫘🫒🧂🥛🥚", color: "from-amber-500/10 to-yellow-500/10", border: "border-amber-200" },
  { name: "Bebidas", icon: <Coffee size={24} />, emoji: "💧🥤🧃☕🍵🍫", color: "from-cyan-500/10 to-teal-500/10", border: "border-cyan-200" },
  { name: "Librería", icon: <BookOpen size={24} />, emoji: "📓✏️🖊️🎒🧮🎨", color: "from-blue-500/10 to-indigo-500/10", border: "border-blue-200" },
];

const CategoryShowcase = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        Explora por Categoría
      </h2>
      <p className="text-muted-foreground text-center mb-8">
        Encuentra todo lo que necesitas organizado para ti
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {categoryData.map((cat) => {
          const count = products.filter(p => p.category === cat.name).length;
          return (
            <Link
              key={cat.name}
              to={`/categoria/${cat.name}`}
              className={`group bg-gradient-to-br ${cat.color} rounded-2xl border ${cat.border} p-5 md:p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-primary">{cat.icon}</span>
                <h3 className="font-heading font-bold text-foreground">{cat.name}</h3>
              </div>
              <p className="text-2xl mb-3 tracking-wider">{cat.emoji}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{count} productos</span>
                <ArrowRight size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryShowcase;
