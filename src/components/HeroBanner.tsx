import heroBanner from "@/assets/hero-banner.jpg";
import { ShoppingCart } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="Productos frescos a domicilio" width={1920} height={800} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
      </div>
      <div className="relative container mx-auto px-4 py-16 md:py-28">
        <div className="max-w-lg">
          <span className="inline-block px-4 py-1.5 bg-secondary text-secondary-foreground text-xs font-semibold rounded-full mb-4 animate-fade-in">
            🚚 Envío a domicilio
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-extrabold text-card mb-4 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Lo pides <span className="text-secondary">"Te lo llevo"</span>
          </h2>
          <p className="text-card/80 text-base md:text-lg mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Restaurantes, heladerías, panadería, farmacia, abarrotes, combos y más. Todo lo que necesitas en un solo lugar.
          </p>
          <a
            href="#productos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <ShoppingCart size={18} />
            Comprar ahora
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
