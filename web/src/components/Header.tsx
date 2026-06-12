import { useAuth, useUser, SignInButton, SignOutButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Header() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300">
        Checkers
      </Link>
      <nav className="flex items-center gap-4">
        <Link to="/" className="text-gray-300 hover:text-white text-sm">
          Play
        </Link>
        <Link to="/ranking" className="text-gray-300 hover:text-white text-sm">
          Ranking
        </Link>
        <Link to="/shop" className="text-gray-300 hover:text-white text-sm">
          Shop
        </Link>
        {isSignedIn ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {user?.username || user?.fullName || user?.emailAddresses?.[0]?.emailAddress}
            </span>
            <SignOutButton>
              <button className="text-sm text-red-400 hover:text-red-300">Sign out</button>
            </SignOutButton>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="text-sm bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded text-white">
              Sign in
            </button>
          </SignInButton>
        )}
      </nav>
    </header>
  );
}
