"use client";
import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Favicon from "@/components/Favicon";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/ui/loader";

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const isAuthRoute = pathname?.startsWith("/login") || 
                      pathname?.startsWith("/create-acount") || 
                      pathname?.startsWith("/otp") || 
                      pathname?.startsWith("/password") || 
                      pathname?.startsWith("/select-interests") || 
                      pathname?.startsWith("/set-password");

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Don't show Header/Footer for auth routes
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative h-screen flex flex-col">
      <Favicon />
      {loading && <PageLoader />}
      <header>
        <Header />
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}

