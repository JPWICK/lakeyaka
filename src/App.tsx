import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import Index from "./pages/Index.tsx";
import Shop from "./pages/Shop.tsx";
import ProductDetail from "./pages/ProductDetail.tsx";
import Cart from "./pages/Cart.tsx";
import Checkout from "./pages/Checkout.tsx";
import OrderConfirmed from "./pages/OrderConfirmed.tsx";
import About from "./pages/About.tsx";
import Auth from "./pages/Auth.tsx";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminProducts from "./pages/admin/AdminProducts.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";
import NotFound from "./pages/NotFound.tsx";

// ... keep imports as they are

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* UPDATE THIS LINE BELOW */}
      <BrowserRouter basename="/lakeyaka">
        <CartProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ... keep all other routes exactly the same */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </CartProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
