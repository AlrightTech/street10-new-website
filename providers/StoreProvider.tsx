"use client";
import { Provider } from "react-redux";
import store from "@/redux";

export function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Completely removed PersistGate - it was blocking navigation
  // The persistedReducer in redux/index.ts handles rehydration automatically
  // The persistor.persist() call in redux/index.ts triggers rehydration without blocking
  // This allows navigation to work immediately while rehydration happens in background
  return <Provider store={store}>{children}</Provider>;
}
