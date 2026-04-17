import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import StoreHeader from "@/components/StoreHeader";
import StoreFooter from "@/components/StoreFooter";
import { ArrowLeft, CreditCard, Banknote, Smartphone, Truck, MapPin, CheckCircle2, ShoppingBag, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { z } from "zod";
import { rateLimit, rateLimitMessage } from "@/lib/rateLimit";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(100),
  phone: z.string().trim().min(7, "Teléfono inválido").max(20),
  email: z.string().trim().email("Correo inválido").max(255).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(500).optional(),
});

const paymentMethods = [
  { id: "efectivo", label: "Efectivo contra entrega", icon: <Banknote size={20} />, description: "Paga al recibir tu pedido" },
  { id: "tarjeta", label: "Tarjeta de crédito/débito", icon: <CreditCard size={20} />, description: "Visa, Mastercard, AMEX" },
  { id: "transferencia", label: "Transferencia bancaria", icon: <Smartphone size={20} />, description: "SPEI o depósito bancario" },
];

const deliveryOptions = [
  { id: "domicilio", label: "Envío a domicilio", icon: <Truck size={20} />, description: "Entrega en 24-48 horas", price: 35 },
  { id: "recoger", label: "Recoger en tienda", icon: <MapPin size={20} />, description: "Disponible en 2 horas", price: 0 },
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("efectivo");
  const [delivery, setDelivery] = useState("domicilio");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", notes: "",
  });

  const deliveryPrice = deliveryOptions.find(d => d.id === delivery)?.price || 0;
  const grandTotal = totalPrice + deliveryPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Debes iniciar sesión para realizar un pedido");
      navigate("/auth");
      return;
    }

    if (!rateLimit(`checkout-${user.id}`, 3, 60_000)) {
      toast.error(rateLimitMessage(60));
      return;
    }

    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.errors[0].message);
    if (delivery === "domicilio" && !parsed.data.address) {
      toast.error("Por favor ingresa tu dirección de envío");
      return;
    }

    setSubmitting(true);

    try {
      // Update profile info
      await supabase.from("profiles").update({
        full_name: form.name,
        phone: form.phone,
        email: form.email || user.email,
      }).eq("user_id", user.id);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          delivery_method: delivery,
          payment_method: paymentMethod,
          address: form.address || null,
          notes: form.notes || null,
          total: grandTotal,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      setOrderPlaced(true);
      clearCart();
      toast.success("¡Pedido realizado con éxito!");
    } catch (error: any) {
      toast.error(error.message || "Error al crear el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShoppingBag size={64} className="mx-auto text-muted-foreground/30" />
            <h2 className="font-heading text-2xl font-bold text-foreground">Tu carrito está vacío</h2>
            <p className="text-muted-foreground">Agrega productos antes de realizar un pedido</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity">
              <ArrowLeft size={18} /> Ir a la tienda
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen flex flex-col">
        <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md mx-auto px-4 animate-fade-in">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} className="text-primary" />
            </div>
            <h2 className="font-heading text-3xl font-bold text-foreground">¡Pedido confirmado!</h2>
            <p className="text-muted-foreground">
              Compra realizada, proceso de entrega. Puedes seguir el estado de tu pedido en "Mis Pedidos".
            </p>
            <div className="bg-muted rounded-xl p-4 text-sm text-left space-y-2">
              <p><strong>Método de pago:</strong> {paymentMethods.find(p => p.id === paymentMethod)?.label}</p>
              <p><strong>Entrega:</strong> {deliveryOptions.find(d => d.id === delivery)?.label}</p>
              <p><strong>Total:</strong> <span className="text-primary font-bold">${grandTotal.toFixed(2)}</span></p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/mis-pedidos" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity">
                Ver mis pedidos
              </Link>
              <Link to="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-full hover:bg-muted/80 transition-colors">
                Seguir comprando
              </Link>
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft size={16} /> Volver a la tienda
          </Link>

          {!user && (
            <div className="bg-accent/50 border border-accent rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm text-accent-foreground">Debes iniciar sesión para completar tu pedido.</p>
              <Link to="/auth" className="text-sm font-medium text-primary hover:underline">
                Iniciar sesión →
              </Link>
            </div>
          )}

          <h1 className="font-heading text-3xl font-extrabold text-foreground mb-8">Finalizar Pedido</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Personal Info */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h3 className="font-heading font-bold text-lg text-foreground">Datos de contacto</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Nombre completo *</label>
                      <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="Tu nombre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Teléfono *</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="(55) 1234-5678" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm" placeholder="tu@email.com" />
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h3 className="font-heading font-bold text-lg text-foreground">Método de entrega</h3>
                  <RadioGroup value={delivery} onValueChange={setDelivery} className="grid sm:grid-cols-2 gap-3">
                    {deliveryOptions.map((opt) => (
                      <label key={opt.id} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${delivery === opt.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                        <RadioGroupItem value={opt.id} className="mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-primary">{opt.icon}</span>
                            <span className="font-medium text-sm text-foreground">{opt.label}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                          <p className="text-sm font-bold text-primary mt-1">{opt.price === 0 ? "Gratis" : `+$${opt.price.toFixed(2)}`}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                  {delivery === "domicilio" && (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-medium text-foreground mb-1">Dirección de envío *</label>
                      <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none" rows={3} placeholder="Calle, número, colonia, código postal..." />
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <h3 className="font-heading font-bold text-lg text-foreground">Método de pago</h3>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === method.id ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"}`}>
                        <RadioGroupItem value={method.id} />
                        <span className="text-primary">{method.icon}</span>
                        <div className="flex-1">
                          <span className="font-medium text-sm text-foreground">{method.label}</span>
                          <p className="text-xs text-muted-foreground">{method.description}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Notes */}
                <div className="bg-card rounded-xl border border-border p-6 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-foreground">Notas del pedido</h3>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm resize-none" rows={3} placeholder="Instrucciones especiales..." />
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border border-border p-6 sticky top-24 space-y-4">
                  <h3 className="font-heading font-bold text-lg text-foreground">Resumen del pedido</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className="text-2xl">{item.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Envío</span><span>{deliveryPrice === 0 ? "Gratis" : `$${deliveryPrice.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between font-heading font-bold text-lg text-foreground pt-2 border-t border-border">
                      <span>Total</span><span className="text-primary">${grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3.5 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity text-base disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting && <Loader2 size={18} className="animate-spin" />}
                    Confirmar Pedido
                  </button>
                  <p className="text-xs text-center text-muted-foreground">Al confirmar, aceptas nuestros términos y condiciones</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <StoreFooter />
    </div>
  );
};

export default Checkout;
