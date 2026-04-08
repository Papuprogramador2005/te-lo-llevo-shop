import { useState } from "react";
import { CartProvider } from "@/context/CartContext";
import StoreHeader from "@/components/StoreHeader";
import HeroBanner from "@/components/HeroBanner";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGrid from "@/components/ProductGrid";
import CartSidebar from "@/components/CartSidebar";
import StoreFooter from "@/components/StoreFooter";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="flex-1">
          <HeroBanner />
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
          <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
        </main>
        <StoreFooter />
        <CartSidebar />
      </div>
    </CartProvider>
  );
};

export default Index;
