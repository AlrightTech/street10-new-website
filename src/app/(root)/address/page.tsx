"use client";
import React, { Suspense } from "react";
import Address from "@/components/general/Address";
import { Loader } from "@/components/ui/loader";

export default function AddressPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Loading address...</p>
          </div>
        </div>
      }
    >
      <Address />
    </Suspense>
  );
}
