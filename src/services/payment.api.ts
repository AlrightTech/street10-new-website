import { apiClient } from './api';

export interface CreatePaymentIntentRequest {
  amountMinor: number;
  currency: string;
  description: string;
  paymentType: 'deposit' | 'order';
  auctionId?: string;
  orderId?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    amountMinor: string;
  };
  message?: string;
}

export const paymentApi = {
  /**
   * Create Stripe payment intent
   */
  createPaymentIntent: async (
    data: CreatePaymentIntentRequest
  ): Promise<CreatePaymentIntentResponse> => {
    const response = await apiClient.post<CreatePaymentIntentResponse>(
      '/payments/create-intent',
      data
    );
    return response.data;
  },
};
