"use client";

import { useEffect, useRef } from "react";
import { settingsApi } from "@/services/settings.api";

export default function Favicon() {
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const updateFavicon = async () => {
      try {
        const settings = await settingsApi.getPublicSettings();
        if (!isMounted || !settings?.logos?.favicon) return;

        // Safely remove existing favicon links
        const existingLinks = document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]');
        existingLinks.forEach((link) => {
          // Check if link still exists in DOM before removing
          if (link.parentNode && link.parentNode.contains(link)) {
            try {
              link.parentNode.removeChild(link);
            } catch (error) {
              // Ignore errors - link might have been removed already
            }
          }
        });

        // Create new favicon link
        const link = document.createElement("link");
        link.rel = "icon";
        link.type = "image/png";
        link.href = settings.logos.favicon;
        linkRef.current = link;
        
        // Only append if component is still mounted and head exists
        if (isMounted && document.head) {
          document.head.appendChild(link);
        }
      } catch (error) {
        console.error("Failed to update favicon:", error);
      }
    };

    updateFavicon();

    // Cleanup function
    return () => {
      isMounted = false;
      // Safely remove the link we created
      if (linkRef.current && linkRef.current.parentNode && linkRef.current.parentNode.contains(linkRef.current)) {
        try {
          linkRef.current.parentNode.removeChild(linkRef.current);
        } catch (error) {
          // Ignore errors during cleanup - link might have been removed already
        }
      }
      linkRef.current = null;
    };
  }, []);

  return null;
}

