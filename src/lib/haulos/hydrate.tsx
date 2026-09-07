import { useEffect, useState, type ReactNode } from "react";
import { useHaul } from "./store";

export function HydrateHaul({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useHaul.persist.rehydrate();
    const t = useHaul.getState().theme;
    document.documentElement.classList.toggle("night", t === "night");
    setReady(true);
  }, []);
  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-paper text-muted text-sm">
        Opening the desk…
      </div>
    );
  }
  return children;
}
