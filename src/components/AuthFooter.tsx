"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MdLocalPhone } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { settingsApi, type PublicSettings } from "@/services/settings.api";

export default function Footer() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getPublicSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const logoUrl = settings?.logos?.websiteLogo || "/icons/logo.svg";
  const phoneNumber = settings?.contact?.phoneNumbers?.[0]?.value || "";
  const email = settings?.contact?.email?.value || "";
  const socialMediaLinks = settings?.contact?.socialMediaLinks || [];

  return (
    <footer className="w-full bg-white shadow-md  ">
      <div className="max-w-7xl  flex flex-col md:flex-row items-center justify-around gap-4  py-3 ">
        <div className="flex items-center gap-2">
          <Image 
            src={logoUrl} 
            alt="Logo" 
            width={40} 
            height={40}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/icons/logo.svg";
            }}
          />
        </div>

        {/* Center - Social */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
          <span className="font-medium text-[#101010] text-lg">
            Join us social platform to stay updated
          </span>
          <div className="flex items-center gap-3">
            {socialMediaLinks.map((link) => (
              <Link key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.icon ? (
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={20}
                    height={20}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-[#101010] text-sm">{link.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Right - Contact */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-gray-700">
          <span className="font-medium text-lg text-[#101010]">Contact</span>
          {email && (
            <div className="flex items-center text-[#4B4B4B] gap-1">
              <IoMail size={16} color="#4B4B4B" /> {email}
            </div>
          )}
          {phoneNumber && (
            <div className="flex items-center gap-1 text-[#4B4B4B]">
              <MdLocalPhone size={16} color="#4B4B4B" /> {phoneNumber}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
