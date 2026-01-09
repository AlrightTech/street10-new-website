"use client";

import { useEffect, useState } from "react";
import { settingsApi, type ContentSection } from "@/services/settings.api";

export default function HelpCenterPage() {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await settingsApi.getPublicContent('help');
        setSections(data.sections || []);
      } catch (error) {
        console.error("Failed to fetch help center:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7931E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
          Help Center
        </h1>

        {sections.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No help center content available.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.id} className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">
                  {index + 1}. {section.title}
                </h2>
                <div className="prose prose-sm sm:prose-base max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {section.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

