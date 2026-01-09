import axios from "axios";

export interface LogosData {
  websiteLogo: string | null;
  appLogo: string | null;
  favicon: string | null;
}

export interface ContactDetail {
  id: string;
  label: string;
  value: string;
}

export interface SocialMediaLink {
  id: string;
  name: string;
  icon: string; // Icon image URL
  url: string;
}

export interface FooterFeature {
  id: string;
  title: string;
  link: string;
}

export interface ContactData {
  phoneNumbers: ContactDetail[];
  email: ContactDetail;
  address: ContactDetail;
  footerOneFeatures: FooterFeature[];
  footerTwoFeatures: FooterFeature[];
  socialMediaLinks: SocialMediaLink[];
}

export interface PublicSettings {
  logos: LogosData;
  contact: ContactData;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string;
}

export interface ContentData {
  sections: ContentSection[];
}

export const settingsApi = {
  /**
   * Get public settings (logos and contact info) - no auth required
   */
  getPublicSettings: async (): Promise<PublicSettings> => {
    // Create a request without auth token for public endpoint
    const response = await axios.get<{ success: boolean; data: PublicSettings }>(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://street10backend.up.railway.app/api/v1"}/public/main-control`,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    return response.data.data;
  },

  /**
   * Get public content page (terms, privacy, help, about) - no auth required
   */
  getPublicContent: async (key: 'terms' | 'privacy' | 'help' | 'about'): Promise<ContentData> => {
    const response = await axios.get<{ success: boolean; data: { key: string; data: ContentData } }>(
      `${process.env.NEXT_PUBLIC_BASE_URL || "https://street10backend.up.railway.app/api/v1"}/public/content/${key}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      }
    );
    return response.data.data.data;
  },
};

