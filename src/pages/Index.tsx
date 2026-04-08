import { useState } from "react";
import StoreHeader from "@/components/StoreHeader";
import HeroBanner from "@/components/HeroBanner";
import CategoryShowcase from "@/components/CategoryShowcase";
import CategoryFilter from "@/components/CategoryFilter";
import ProductGrid from "@/components/ProductGrid";
import CartSidebar from "@/components/CartSidebar";
import StoreFooter from "@/components/StoreFooter";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main className="flex-1">
        <HeroBanner />
        <CategoryShowcase />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <ProductGrid category={selectedCategory} searchQuery={searchQuery} />
      </main>
      <StoreFooter />
      <CartSidebar />
    </div>
  );
};

export default Index;
