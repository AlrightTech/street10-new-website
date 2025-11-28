"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthHeader from "../../components/AuthHeader";
import Footer from "../../components/AuthFooter";

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/");
    }
  }, [router]);

  return (
    <main>
      <AuthHeader />
      {children}

      <Footer />
    </main>
  );
};

export default AuthLayout;
