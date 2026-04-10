import { ShoppingCart, Search, Menu, User, LogOut, Package, Shield } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import logoTL from "@/assets/logo-tl.png";
import { useState } from "react";

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const StoreHeader = ({ searchQuery, onSearchChange }: StoreHeaderProps) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, role, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img src={logoTL} alt="Te Lo Llevo" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12" />
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-lg md:text-xl text-foreground leading-tight">
                TE LO LLEVO
              </h1>
              <p className="text-xs text-muted-foreground">Tu tienda de confianza</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all"
              />
            </div>
          </div>

          {/* Nav Links - Desktop */}
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <a href="#productos" className="hover:text-primary transition-colors">Productos</a>
            <a href="#categorias" className="hover:text-primary transition-colors">Categorías</a>
            {user && (
              <Link to="/mis-pedidos" className="hover:text-primary transition-colors flex items-center gap-1">
                <Package size={16} /> Mis Pedidos
              </Link>
            )}
            {(role === "employee" || role === "admin") && (
              <Link to="/empleado" className="hover:text-primary transition-colors flex items-center gap-1">
                <Shield size={16} /> Panel
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { signOut(); }}
                className="hover:text-destructive transition-colors flex items-center gap-1"
              >
                <LogOut size={16} /> Salir
              </button>
            ) : (
              <Link to="/auth" className="hover:text-primary transition-colors flex items-center gap-1">
                <User size={16} /> Entrar
              </Link>
            )}
          </nav>

          {/* Cart & Mobile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              />
            </div>
            <nav className="flex flex-col gap-2 text-sm font-medium text-muted-foreground">
              <a href="#productos" className="py-2 px-3 rounded-lg hover:bg-muted transition-colors">Productos</a>
              <a href="#categorias" className="py-2 px-3 rounded-lg hover:bg-muted transition-colors">Categorías</a>
              {user && (
                <Link to="/mis-pedidos" className="py-2 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                  <Package size={16} /> Mis Pedidos
                </Link>
              )}
              {(role === "employee" || role === "admin") && (
                <Link to="/empleado" className="py-2 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                  <Shield size={16} /> Panel Empleado
                </Link>
              )}
              {user ? (
                <button onClick={() => signOut()} className="py-2 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2 text-left">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              ) : (
                <Link to="/auth" className="py-2 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                  <User size={16} /> Iniciar sesión
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default StoreHeader;
