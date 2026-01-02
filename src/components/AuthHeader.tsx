"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { settingsApi } from "@/services/settings.api";

export default function Header() {
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup";
  const [logoUrl, setLogoUrl] = useState<string>("/icons/logo.svg");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const settings = await settingsApi.getPublicSettings();
        if (settings?.logos?.websiteLogo) {
          setLogoUrl(settings.logos.websiteLogo);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };

    fetchLogo();
  }, []);

  return (
    <div className=" flex items-center justify-between px-10  bg-white w-full">
      <Link href="/">
        <Image 
          src={logoUrl} 
          alt="Logo" 
          width={50} 
          height={50}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/icons/logo.svg";
          }}
        />
      </Link>

      {!isSignupPage && (
        <Link
          href="/signup"
          className="bg-[#ee8e31]  cursor-pointer text-white px-8 py-3 rounded-md font-semibold  transition"
        >
          Join Us
        </Link>
      )}
    </div>
  );
}
