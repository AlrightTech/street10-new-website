"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AuthHeader from "../../components/AuthHeader";
import Footer from "../../components/AuthFooter";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  // Hide AuthHeader on signup page since main Header is already shown
  const isSignupPage = pathname === "/signup";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  return (
    <main>
      {!isSignupPage && <AuthHeader />}
      {children}

      <Footer />
    </main>
  );
};

export default AuthLayout;
