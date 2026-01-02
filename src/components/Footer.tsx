"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { MdLocalPhone } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";
import { settingsApi, type PublicSettings } from "@/services/settings.api";

export default function Footer() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getPublicSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const logoUrl = settings?.logos?.websiteLogo || "/icons/logo.svg";
  const phoneNumber = settings?.contact?.phoneNumbers?.[0]?.value || "";
  const email = settings?.contact?.email?.value || "";
  const address = settings?.contact?.address?.value || "";
  const socialMediaLinks = settings?.contact?.socialMediaLinks || [];

  return (
    <footer className="w-full bg-[#4c50a2] text-white">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + Links */}
        <div>
          <div className="flex items-center gap-2 mb-4 md:ms-12">
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
          <ul className="space-y-2 text-sm md:ms-12">
            <li>
              <Link href="#">Contact Us</Link>
            </li>
            <li>
              <Link href="#">Help & Center</Link>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-semibold mb-4">Features</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/bidding">Bidding</Link>
            </li>
            <li>
              <Link href="/e-commerce">E-commerce</Link>
            </li>
            <li>
              <Link href="/vendors">Vendors</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info + Social */}
        <div className="md:-ms-22">
          <h3 className="font-semibold mb-4 ">
            Join us social platform to stay updated
          </h3>
          <div className="space-y-2 text-sm">
            {phoneNumber && (
              <div className="flex items-center gap-2">
                <MdLocalPhone size={16} /> {phoneNumber}
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2">
                <IoMail size={16} /> {email}
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2">
                <MdLocationOn size={16} /> {address}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            {socialMediaLinks.map((link) => (
              <Link key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                {link.icon ? (
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={24}
                    height={24}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="text-white text-sm">{link.name}</span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-4">
            Receive updates from our weekly newsletter.
          </h3>
          <p className="text-sm mb-4">
            Be the first to get notified about new Street features & updates.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 bg-white rounded-l-md text-black w-full text-sm outline-none"
            />
            <button className="bg-[#ee8e31] text-nowrap px-2 py-2 cursor-pointer rounded-r-md text-sm font-semibold">
              Notify Me
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className=" text-center pb-3 text-sm">
        Copyright ©2023. All right reserved
      </div>
    </footer>
  );
}
