import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { api } from "../lib/api";
import { SignInButton } from "@clerk/clerk-react";

interface Skin {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  boardColors: { light: string; dark: string };
  pieceColors: { player: string; ai: string };
}

export default function ShopPage() {
  const { isSignedIn, userId } = useAuth();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [ownedSkins, setOwnedSkins] = useState<string[]>([]);
  const [equippedSkin, setEquippedSkin] = useState<string>("classic");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.skins.getAll();
        setSkins(data.skins as unknown as Skin[]);
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await api.ranking.getUser(userId!);
        const user = data.user as { ownedSkins?: string[]; equippedSkin?: string };
        if (user?.ownedSkins) setOwnedSkins(user.ownedSkins);
        if (user?.equippedSkin) setEquippedSkin(user.equippedSkin);
      } catch {
        // user not synced
      }
    })();
  }, [userId]);

  const handleBuy = async (skinId: string) => {
    setError(null);
    try {
      const data = await api.skins.createCheckout(skinId);
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar la compra");
    }
  };

  const handleEquip = async (skinId: string) => {
    setError(null);
    try {
      await api.skins.equip(skinId);
      setEquippedSkin(skinId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al equipar");
    }
  };

  if (loading) return <div className="min-h-[calc(100vh-60px)] p-6 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-[calc(100vh-60px)] p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Skin Shop</h1>
      <p className="text-gray-400 mb-6">Customize your checkers board with unique skins.</p>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!isSignedIn && (
        <div className="bg-gray-800 rounded-lg p-6 text-center mb-6">
          <p className="text-gray-300 mb-3">Sign in to purchase and equip skins.</p>
          <SignInButton mode="modal">
            <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white font-medium">
              Sign in
            </button>
          </SignInButton>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skins.map((skin) => {
          const isOwned = ownedSkins.includes(skin.id);
          const isEquipped = equippedSkin === skin.id;

          return (
            <div
              key={skin.id}
              className={`bg-gray-800 rounded-lg overflow-hidden border-2 ${
                isEquipped ? "border-indigo-500" : "border-gray-700"
              }`}
            >
              <div className="h-32 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${skin.boardColors.light} 50%, ${skin.boardColors.dark} 50%)` }}>
                <div className="flex gap-1">
                  <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: skin.pieceColors.player, borderColor: "#555" }}
                  />
                  <div
                    className="w-8 h-8 rounded-full border-2"
                    style={{ backgroundColor: skin.pieceColors.ai, borderColor: "#ccc" }}
                  />
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">{skin.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{skin.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-indigo-400">
                    {skin.price === 0 ? "Free" : `$${(skin.price / 100).toFixed(2)}`}
                  </span>
                  {isEquipped ? (
                    <span className="text-sm text-green-400 font-medium">Equipped ✓</span>
                  ) : isOwned ? (
                    <button
                      onClick={() => handleEquip(skin.id)}
                      className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(skin.id)}
                      disabled={!isSignedIn}
                      className="text-sm bg-green-600 hover:bg-green-500 px-3 py-1.5 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {skin.price === 0 ? "Get" : "Buy"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
