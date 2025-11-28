"use client";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  // Header and Footer are already provided by RootLayoutWrapper
  // This layout is just for route grouping
  return <>{children}</>;
}
