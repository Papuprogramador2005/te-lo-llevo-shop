import { categories } from "@/data/products";
import { Apple, Carrot, Package, BookOpen, LayoutGrid } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  Todos: <LayoutGrid size={18} />,
  Frutas: <Apple size={18} />,
  Verduras: <Carrot size={18} />,
  Abarrotes: <Package size={18} />,
  Librería: <BookOpen size={18} />,
};

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <section id="categorias" className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              selected === cat
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {categoryIcons[cat]}
            {cat}
          </button>
        ))}
      </div>
    </section>
  );
};

export default CategoryFilter;
