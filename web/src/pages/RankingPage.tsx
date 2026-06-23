import { useEffect, useState } from "react";
import { api } from "../lib/api";

interface RankingEntry {
  username: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.ranking.getAll();
        setRanking(data.ranking as unknown as RankingEntry[]);
      } catch {
        // ignore
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-[calc(100vh-60px)] p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Ranking</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : ranking.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No games played yet.</p>
          <p className="text-gray-500 text-sm mt-2">Play a game and save your result to appear here!</p>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-700 text-gray-300 text-sm uppercase">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Player</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">W</th>
                <th className="px-4 py-3">L</th>
                <th className="px-4 py-3">D</th>
                <th className="px-4 py-3">Games</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((entry, i) => (
                <tr
                  key={i}
                  className={`border-t border-gray-700 ${
                    i === 0 ? "bg-yellow-900/20" : ""
                  } hover:bg-gray-700/50`}
                >
                  <td className="px-4 py-3 text-gray-400">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{entry.username}</td>
                  <td className="px-4 py-3 text-indigo-400 font-bold">{entry.rating}</td>
                  <td className="px-4 py-3 text-green-400">{entry.wins}</td>
                  <td className="px-4 py-3 text-red-400">{entry.losses}</td>
                  <td className="px-4 py-3 text-yellow-400">{entry.draws}</td>
                  <td className="px-4 py-3 text-gray-300">{entry.gamesPlayed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
