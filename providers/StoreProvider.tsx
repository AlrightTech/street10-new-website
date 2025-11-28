"use client";
import { Provider } from "react-redux";
import store, { persistor } from "@/redux";
import { useState, useEffect } from "react";
import { PersistGate } from "redux-persist/integration/react";
export function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
