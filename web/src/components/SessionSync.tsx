import { useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import { setSession } from "../lib/api";
import { api } from "../lib/api";

export default function SessionSync() {
  const { session } = useSession();

  useEffect(() => {
    if (session) {
      setSession(session);
      (async () => {
        try {
          const user = session.user;
          await api.users.sync({
            username: user.username || user.fullName || undefined,
            email: user.emailAddresses?.[0]?.emailAddress || undefined,
          });
        } catch {
          // silent
        }
      })();
    } else {
      setSession(null);
    }
  }, [session]);

  return null;
}
