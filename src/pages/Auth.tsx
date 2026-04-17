import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import logoTL from "@/assets/logo-tl.png";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { rateLimit, rateLimitMessage } from "@/lib/rateLimit";

const emailSchema = z.string().trim().email("Correo inválido").max(255);
const passwordSchema = z.string().min(6, "Mínimo 6 caracteres").max(72, "Máximo 72 caracteres");
const nameSchema = z.string().trim().min(2, "Nombre muy corto").max(100, "Máximo 100 caracteres");

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (role === "employee" || role === "admin") navigate("/empleado");
      else navigate("/");
    }
  }, [user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rateLimit(`auth-${email}`, 5, 60_000)) {
      toast.error(rateLimitMessage(60));
      return;
    }

    const emailParsed = emailSchema.safeParse(email);
    if (!emailParsed.success) return toast.error(emailParsed.error.errors[0].message);
    const passParsed = passwordSchema.safeParse(password);
    if (!passParsed.success) return toast.error(passParsed.error.errors[0].message);
    if (!isLogin) {
      const nameParsed = nameSchema.safeParse(fullName);
      if (!nameParsed.success) return toast.error(nameParsed.error.errors[0].message);
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: emailParsed.data, password: passParsed.data });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
      } else {
        const { error } = await supabase.auth.signUp({
          email: emailParsed.data, password: passParsed.data,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada!");
      }
    } catch (error: any) {
      toast.error(error.message || "Error de autenticación");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoTL} alt="Te Lo Llevo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="font-heading text-3xl font-extrabold text-foreground">TE LO LLEVO</h1>
          <p className="text-muted-foreground text-sm mt-1 italic">Lo pides "Te lo llevo"</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
          <h2 className="font-heading text-xl font-bold text-foreground mb-6">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nombre completo</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                  placeholder="Tu nombre" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
                placeholder="tu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm pr-10"
                  placeholder="••••••••" required minLength={6} maxLength={72} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {isLogin ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>

          {/* Admin hint */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <ShieldCheck size={14} className="text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Acceso administrativo</p>
                <p>Correo: <code className="bg-background px-1 rounded">admin@telollevo.com</code></p>
                <p>Contraseña: <code className="bg-background px-1 rounded">Admin1Telollevo!</code></p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Volver a la tienda
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
