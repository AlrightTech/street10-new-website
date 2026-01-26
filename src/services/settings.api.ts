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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error(
        "Missing NEXT_PUBLIC_BASE_URL. Set it in your website .env (e.g. https://api.st10.info/api/v1)."
      );
    }

    // Create a request without auth token for public endpoint
    const response = await axios.get<{ success: boolean; data: PublicSettings }>(
      `${baseUrl}/public/main-control`,
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
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      throw new Error(
        "Missing NEXT_PUBLIC_BASE_URL. Set it in your website .env (e.g. https://api.st10.info/api/v1)."
      );
    }

    const response = await axios.get<{ success: boolean; data: { key: string; data: ContentData } }>(
      `${baseUrl}/public/content/${key}`,
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

