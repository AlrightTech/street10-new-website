import { apiClient } from "./api";

export interface WalletBalance {
  availableMinor: string;
  onHoldMinor: string;
  lockedMinor: string;
  currency: string;
}

export const walletApi = {
  /**
   * Get current wallet balance
   */
  getBalance: async (): Promise<WalletBalance> => {
    const response = await apiClient.get<{
      success: boolean;
      data: WalletBalance;
    }>("/wallet/balance");

    if (!response.data.success || !response.data.data) {
      throw new Error("Failed to fetch wallet balance");
    }

    return response.data.data;
  },

  /**
   * Deposit funds to wallet (amount in QAR, converted to minor units)
   * NOTE: This endpoint currently trusts the request and does not trigger Stripe.
   * In production, you should wrap this with a Stripe payment flow.
   */
  deposit: async (
    amountQar: number
  ): Promise<{
    success: boolean;
    data: any;
    message?: string;
  }> => {
    const amountMinor = Math.round(amountQar * 100);
    const response = await apiClient.post("/wallet/deposit", {
      amountMinor,
    });
    return response.data;
  },
};

