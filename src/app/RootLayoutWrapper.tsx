"use client";
import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Favicon from "@/components/Favicon";
import PromotionalPopup from "@/components/ui/PromotionalPopup";
import TopHeader from "@/components/home/TopHeader";
import { usePathname } from "next/navigation";
import { PageLoader } from "@/components/ui/loader";

export default function RootLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const isAuthRoute = pathname?.startsWith("/login") || 
                      pathname?.startsWith("/create-acount") || 
                      pathname?.startsWith("/otp") || 
                      pathname?.startsWith("/password") || 
                      pathname?.startsWith("/select-interests") || 
                      pathname?.startsWith("/set-password");

  // Only show loading on initial mount, not on navigation
  useEffect(() => {
    if (isInitialLoad) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
        setIsInitialLoad(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInitialLoad]);

  // Reset initial load flag when pathname changes (navigation occurred)
  useEffect(() => {
    setIsInitialLoad(false);
  }, [pathname]);

  // Don't show Header/Footer for auth routes
  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <Favicon />
      {loading && isInitialLoad && <PageLoader />}
      {/* Winner Banner - Above Header */}
      <TopHeader />
      <header className="flex-shrink-0">
        <Header />
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>

      <Footer />
      
      {/* Promotional Popup */}
      <PromotionalPopup />
    </div>
  );
}

