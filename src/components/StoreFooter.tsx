import { MapPin, Phone, Clock } from "lucide-react";
import logoTL from "@/assets/logo-tl.png";
import ReviewsSection from "@/components/ReviewsSection";

const StoreFooter = () => {
  return (
    <>
      <ReviewsSection />
      <footer id="contacto" className="bg-foreground text-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoTL} alt="Te Lo Llevo" width={40} height={40} loading="lazy" className="w-10 h-10 rounded-lg bg-card p-1" />
                <span className="font-heading font-bold text-lg">TE LO LLEVO</span>
              </div>
              <p className="text-card/60 text-sm leading-relaxed italic">
                Lo pides <span className="text-secondary font-semibold">"Te lo llevo"</span>
              </p>
              <p className="text-card/50 text-xs mt-2">
                Tu tienda de confianza con productos frescos, restaurantes, farmacia, librería y mucho más.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-heading font-semibold mb-4">Contáctanos</h4>
              <div className="flex items-center gap-2 text-sm text-card/70">
                <MapPin size={16} className="text-secondary" /> Col. Centro, Ciudad de México
              </div>
              <div className="flex items-center gap-2 text-sm text-card/70">
                <Phone size={16} className="text-secondary" /> (55) 1234-5678
              </div>
              <div className="flex items-center gap-2 text-sm text-card/70">
                <Clock size={16} className="text-secondary" /> Lun-Sáb 8:00 - 20:00
              </div>
              <a href="#resenas" className="inline-block text-sm text-secondary hover:underline mt-2">
                Ver reseñas de clientes →
              </a>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4">Categorías</h4>
              <ul className="space-y-2 text-sm text-card/70">
                <li>🎁 Combos</li>
                <li>🍔 Restaurantes</li>
                <li>🍦 Heladerías</li>
                <li>🥖 Panadería</li>
                <li>💊 Farmacia</li>
                <li>🍎 Frutas y Verduras</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-card/10 mt-8 pt-6 text-center text-xs text-card/40">
            © 2026 Te Lo Llevo. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  );
};

export default StoreFooter;
