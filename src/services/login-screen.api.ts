import axios from "axios";

export type LoginScreenTarget = "website_login" | "registration";

export interface ActiveLoginScreen {
  id: string;
  title: string;
  backgroundUrl: string;
  target: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
}

export const loginScreenApi = {
  /**
   * Get active login screen for website login or registration page (public - no auth).
   * Returns null if none active or on 404.
   */
  getActiveLoginScreen: async (
    target: LoginScreenTarget
  ): Promise<ActiveLoginScreen | null> => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) {
      console.warn(
        "Missing NEXT_PUBLIC_BASE_URL. Login screen background will use default."
      );
      return null;
    }

    try {
      const response = await axios.get<{
        success: boolean;
        data: ActiveLoginScreen;
      }>(`${baseUrl}/public/login-screen/active`, {
        params: { target },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });
      return response.data.data ?? null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Failed to fetch active login screen:", error);
      return null;
    }
  },
};
