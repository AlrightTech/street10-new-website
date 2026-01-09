"use client";

import { useEffect, useState } from "react";
import { settingsApi, type PublicSettings } from "@/services/settings.api";
import { MdLocalPhone } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";

export default function ContactPage() {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getPublicSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch contact information:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7931E]"></div>
      </div>
    );
  }

  const phoneNumbers = settings?.contact?.phoneNumbers || [];
  const email = settings?.contact?.email?.value || "";
  const address = settings?.contact?.address?.value || "";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          Contact Us
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
          {/* Phone Numbers */}
          {phoneNumbers.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdLocalPhone size={24} className="text-[#F7931E]" />
                Phone Numbers
              </h2>
              <div className="space-y-2">
                {phoneNumbers.map((phone) => (
                  <p key={phone.id} className="text-gray-700 text-lg">
                    {phone.value}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Email */}
          {email && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <IoMail size={24} className="text-[#F7931E]" />
                Email Address
              </h2>
              <a
                href={`mailto:${email}`}
                className="text-gray-700 text-lg hover:text-[#F7931E] transition-colors"
              >
                {email}
              </a>
            </div>
          )}

          {/* Address */}
          {address && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MdLocationOn size={24} className="text-[#F7931E]" />
                Address
              </h2>
              <p className="text-gray-700 text-lg whitespace-pre-wrap">
                {address}
              </p>
            </div>
          )}

          {/* Empty State */}
          {phoneNumbers.length === 0 && !email && !address && (
            <div className="text-center py-8">
              <p className="text-gray-600">No contact information available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

