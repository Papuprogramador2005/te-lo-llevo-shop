import { combosInfo, products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

const groupTitles: Record<string, { title: string; subtitle: string }> = {
  "Básicos": {
    title: "🎁 Combos Básicos",
    subtitle: "Lo esencial para tu día a día, listo y económico",
  },
  "Rápidos": {
    title: "⚡ Combos Rápidos",
    subtitle: "Comida para preparar en minutos y saciar tus antojos",
  },
  "Familiares": {
    title: "👨‍👩‍👧‍👦 Combos Familiares",
    subtitle: "Toda la semana cubierta para tu familia",
  },
};

const CombosShowcase = () => {
  const { addToCart } = useCart();
  const groups = ["Básicos", "Rápidos", "Familiares"] as const;

  const handleAdd = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <section className="container mx-auto px-4 py-12 space-y-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-xs font-semibold mb-3">
          <Sparkles size={14} /> Combos exclusivos
        </div>
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Combos pensados para ti
        </h2>
        <p className="text-muted-foreground mt-2">Ahorra tiempo y dinero con nuestras selecciones</p>
      </div>

      {groups.map((g) => {
        const items = combosInfo.filter((c) => c.group === g);
        const meta = groupTitles[g];
        return (
          <div key={g} className="space-y-4">
            <div>
              <h3 className="font-heading text-xl font-bold text-foreground">{meta.title}</h3>
              <p className="text-sm text-muted-foreground">{meta.subtitle}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((c) => {
                const product = products.find((p) => p.id === c.id);
                return (
                  <div
                    key={c.id}
                    className="bg-card rounded-2xl border border-border p-5 space-y-3 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-heading font-bold text-lg text-foreground">{c.name}</h4>
                    <p className="text-sm text-muted-foreground italic">"{c.tagline}"</p>
                    <ul className="space-y-1 text-sm text-foreground">
                      {c.items.map((it) => (
                        <li key={it} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span> {it}
                        </li>
                      ))}
                    </ul>
                    {product && (
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <span className="font-heading font-bold text-lg text-primary">
                          ${product.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => handleAdd(c.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Plus size={14} /> Agregar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default CombosShowcase;
