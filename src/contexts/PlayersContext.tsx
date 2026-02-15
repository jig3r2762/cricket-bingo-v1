import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CricketPlayer } from "@/types/game";

interface PlayersContextValue {
  players: CricketPlayer[];
  loading: boolean;
  error: string | null;
}

const PlayersContext = createContext<PlayersContextValue>({
  players: [],
  loading: true,
  error: null,
});

export function PlayersProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<CricketPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/players.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load players: ${res.status}`);
        return res.json();
      })
      .then((data: CricketPlayer[]) => {
        if (!cancelled) {
          setPlayers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load player data");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PlayersContext.Provider value={{ players, loading, error }}>
      {children}
    </PlayersContext.Provider>
  );
}

export function usePlayers() {
  return useContext(PlayersContext);
}
