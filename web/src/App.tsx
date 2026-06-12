import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Header from "./components/Header";
import SessionSync from "./components/SessionSync";
import GamePage from "./pages/GamePage";
import RankingPage from "./pages/RankingPage";
import ShopPage from "./pages/ShopPage";

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <BrowserRouter>
        <SessionSync />
        <Header />
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/shop" element={<ShopPage />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  );
}
