"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IoIosArrowRoundForward } from "react-icons/io";
import { Loader } from "@/components/ui/loader";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentApi } from "@/services/payment.api";
import { orderApi } from "@/services/order.api";
import type { Order } from "@/services/order.api";
import Image from "next/image";

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Stripe Payment Form Component
function StripePaymentForm({ 
  clientSecret, 
  paymentType, 
  orderId, 
  auctionId,
  paymentIntentId,
  amount,
  order,
  onSuccess,
  onError 
}: {
  clientSecret: string;
  paymentType: 'deposit' | 'order';
  orderId?: string | null;
  auctionId?: string | null;
  paymentIntentId?: string | null;
  amount: number;
  order?: Order | null;
  onSuccess: () => void;
  onError: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm payment with Stripe
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setErrorMessage(submitError.message || 'An error occurred');
        setProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?type=${paymentType}${orderId ? `&orderId=${orderId}` : ''}${auctionId ? `&auctionId=${auctionId}` : ''}`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Always call API directly to ensure payment is confirmed immediately
        // The API endpoint is idempotent (checks if already processed), so it's safe to call even if webhook already processed it
        // This ensures payment is confirmed even if webhooks are delayed
        console.log('✅ Payment succeeded, confirming with backend...');
        try {
          if (paymentType === 'deposit' && auctionId && paymentIntentId) {
            // Confirm deposit payment with backend immediately after Stripe confirms
            const { auctionApi } = await import('@/services/auction.api');
            await auctionApi.confirmDepositPayment(auctionId, paymentIntentId);
            console.log('✅ Deposit payment confirmed and recorded in database');
          } else if (paymentType === 'order' && orderId) {
            // For auction orders, payment is handled via webhook (no need to call API)
            // For regular e-commerce orders, call completePayment API
            // Check if it's an auction order by checking if order has auctionId
            if (order && !order.auctionId) {
              await orderApi.completePayment(orderId);
              console.log('✅ Order payment completed');
            } else {
              console.log('✅ Auction order payment will be processed via webhook');
            }
          }
        } catch (apiError: any) {
          console.error('❌ Error confirming payment with backend:', apiError);
          
          // Check if error is because payment was already processed (idempotent check)
          const errorMessage = apiError?.response?.data?.message || '';
          if (errorMessage.includes('already') || errorMessage.includes('alreadyPaid')) {
            // Payment was already processed (likely by webhook), this is fine
            console.log('ℹ️ Payment already processed (likely by webhook), proceeding...');
          } else {
            // Payment succeeded with Stripe but backend confirmation failed
            const errorMsg = apiError?.response?.data?.message || 'Payment succeeded but could not be recorded. Please contact support.';
            setErrorMessage(errorMsg);
            setProcessing(false);
            onError(errorMsg);
            return; // Don't proceed to success - payment not recorded
          }
        }
        
        // Small delay to let Stripe Elements clean up before redirecting
        setTimeout(() => {
          onSuccess();
        }, 100);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setErrorMessage(errorMsg);
      onError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="w-full bg-[#EE8E32] text-white py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <Loader size="sm" color="#ffffff" />
            Processing...
          </>
        ) : (
          <>
            Pay {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR
            <IoIosArrowRoundForward size={20} />
          </>
        )}
      </button>
    </form>
  );
}

function PaymentPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentType = (searchParams.get("type") || "order") as 'deposit' | 'order';
  const auctionId = searchParams.get("auctionId");
  const orderId = searchParams.get("orderId");
  const clientSecretParam = searchParams.get("clientSecret");
  const amountParam = searchParams.get("amount");
  const paymentIntentIdParam = searchParams.get("paymentIntentId");
  
  const [clientSecret, setClientSecret] = useState<string | null>(clientSecretParam);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(paymentIntentIdParam);
  const [loading, setLoading] = useState(!clientSecretParam);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(0);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch order details if it's an order payment
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (paymentType === 'order' && orderId && !order) {
        try {
          const response = await orderApi.getById(orderId);
          if (response.success && response.data?.order) {
            setOrder(response.data.order);
            // Use remainingPayment if available and > 0 (for auction orders with deposit),
            // otherwise use totalMinor (for regular e-commerce orders)
            const remainingPayment = response.data.order.remainingPayment 
              ? parseFloat(response.data.order.remainingPayment) 
              : 0;
            const orderAmount = remainingPayment > 0
              ? remainingPayment / 100
              : parseFloat(response.data.order.totalMinor || '0') / 100;
            setAmount(orderAmount);
          }
        } catch (err) {
          console.error('Error fetching order:', err);
        }
      } else if (amountParam && !amount) {
        const amountMinor = parseFloat(amountParam);
        setAmount(amountMinor / 100);
      }
    };

    fetchOrderDetails();
  }, [paymentType, orderId, amountParam]); // Removed order and amount from dependencies to prevent loops

  // Create payment intent if not provided
  useEffect(() => {
    const createPaymentIntent = async () => {
      // Don't create if clientSecret already exists
      if (clientSecret || clientSecretParam) {
        setLoading(false);
        return;
      }

      // For order payments, wait for order to be fetched
      if (paymentType === 'order' && orderId && !order) {
        // Order is still being fetched, wait for it
        return;
      }

      if (!orderId && !auctionId) {
        setError('Missing order ID or auction ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        let amountMinor = 0;
        let currency = 'QAR';
        let description = '';

        if (paymentType === 'order' && orderId) {
          if (order) {
            // Check if this is an auction order
            if (order.auctionId && order.paymentStage) {
              // Auction order - use the appropriate payment endpoint based on paymentStage
              let paymentResponse;
              try {
                if (order.paymentStage === 'down_payment_required') {
                  paymentResponse = await orderApi.payDownPayment(orderId);
                } else if (order.paymentStage === 'final_payment_required') {
                  paymentResponse = await orderApi.payFinalPayment(orderId);
                } else if (order.paymentStage === 'full_payment_required') {
                  paymentResponse = await orderApi.payFullPayment(orderId);
                } else {
                  setError('Order is not in a valid payment stage. Please contact support.');
                  setLoading(false);
                  return;
                }

                if (paymentResponse.success && paymentResponse.data?.paymentIntent) {
                  setClientSecret(paymentResponse.data.paymentIntent.clientSecret);
                  if (paymentResponse.data.paymentIntent.paymentIntentId) {
                    setPaymentIntentId(paymentResponse.data.paymentIntent.paymentIntentId);
                  }
                  setAmount(parseFloat(paymentResponse.data.paymentIntent.amountMinor || '0') / 100);
                  setLoading(false);
                  return;
                } else {
                  setError('Failed to create payment intent for auction order');
                  setLoading(false);
                  return;
                }
              } catch (err: any) {
                console.error('Error creating auction payment intent:', err);
                setError(err?.response?.data?.message || 'Failed to initialize payment. Please try again.');
                setLoading(false);
                return;
              }
            } else {
              // Regular e-commerce order
              // Use remainingPayment if available and > 0 (for auction orders with deposit),
              // otherwise use totalMinor (for regular e-commerce orders)
              const remainingPayment = order.remainingPayment ? parseFloat(order.remainingPayment) : 0;
              amountMinor = remainingPayment > 0 
                ? remainingPayment
                : parseFloat(order.totalMinor || '0');
              currency = order.currency || 'QAR';
              description = `Payment for order: ${order.orderNumber}`;
            }
          } else if (amountParam) {
            // Fallback: use amount from URL if order not loaded yet
            amountMinor = parseFloat(amountParam);
            currency = 'QAR';
            description = `Payment for order`;
          } else {
            setError('Missing order information. Please try again.');
            setLoading(false);
            return;
          }
        } else if (paymentType === 'deposit' && auctionId && amountParam) {
          amountMinor = parseFloat(amountParam);
          description = `Deposit for auction`;
        } else {
          setError('Missing required payment information');
          setLoading(false);
          return;
        }

        // Validate amount
        if (!amountMinor || amountMinor <= 0) {
          setError('Invalid payment amount. Please contact support.');
          setLoading(false);
          return;
        }

        const response = await paymentApi.createPaymentIntent({
          amountMinor: Math.round(amountMinor),
          currency,
          description,
          paymentType,
          orderId: orderId || undefined,
          auctionId: auctionId || undefined,
        });

        if (response.success && response.data?.clientSecret) {
          setClientSecret(response.data.clientSecret);
          if (response.data.paymentIntentId) {
            setPaymentIntentId(response.data.paymentIntentId);
          }
          if (!amount) {
            setAmount(parseFloat(response.data.amountMinor || '0') / 100);
          }
        } else {
          setError('Failed to create payment intent');
        }
      } catch (err: any) {
        console.error('Error creating payment intent:', err);
        setError(err?.response?.data?.message || 'Failed to initialize payment. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [clientSecretParam, paymentType, orderId, auctionId, amountParam, order]); // Removed amount from dependencies

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    // Redirect is handled in useEffect above to avoid React unmount issues
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  // Handle redirect immediately when payment succeeds (useEffect to avoid React unmount issues)
  useEffect(() => {
    if (paymentSuccess) {
      const timeoutId = setTimeout(() => {
        if (paymentType === 'deposit' && auctionId) {
          // Add paymentCompleted parameter to indicate deposit was just paid
          // This allows the car preview page to wait longer/retry checking deposit status
          window.location.href = `/car-preview?id=${auctionId}&type=auction&paymentCompleted=true`;
        } else if (paymentType === 'order' && orderId) {
          window.location.href = `/order-history`;
        } else {
          window.location.href = '/order-history';
        }
      }, 1500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [paymentSuccess, paymentType, auctionId, orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Initializing payment...</p>
        </div>
      </div>
    );
  }

  if (error && !clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="bg-[#EE8E32] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#d67a1f] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              {paymentType === 'deposit' 
                ? 'Your deposit has been processed. You can now place bids on this auction.'
                : 'Your order payment has been completed successfully.'}
            </p>
            <Loader size="sm" />
            <p className="mt-2 text-sm text-gray-500">Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600">Setting up payment...</p>
        </div>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">
          {paymentType === 'deposit' ? 'Pay Deposit' : 'Complete Payment'}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Section - Payment Form */}
          <div className="lg:col-span-8 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
            
            <Elements stripe={stripePromise} options={options}>
              <StripePaymentForm
                clientSecret={clientSecret}
                paymentType={paymentType}
                orderId={orderId}
                auctionId={auctionId}
                paymentIntentId={paymentIntentId}
                amount={amount}
                order={order}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => router.back()}
                className="text-[#000000] py-2 px-4 rounded-lg bg-[#F3F5F6] font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Right Section - Payment Summary */}
          <div className="lg:col-span-4 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            
            {paymentType === 'order' && order ? (
              <>
                {order.items?.map((item) => {
                  const product = item.product;
                  const imageUrl = product?.media?.[0]?.url || "/images/cars/car-1.jpg";
                  const price = parseFloat(item.priceMinor || '0') / 100;

                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg mb-3 bg-gray-50">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={imageUrl}
                          alt={product?.title || "Product"}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product?.title || "Product"}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#EE8E32] text-sm">
                        {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                      </p>
                    </div>
                  );
                })}

                <div className="space-y-2 text-gray-700 border-t pt-4 mt-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{(parseFloat(order.totalMinor || '0') / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-[#EE8E32]">
                      {(parseFloat(order.totalMinor || '0') / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {order.currency || 'QAR'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between text-sm">
                  <span>Amount</span>
                  <span>{amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-3 mt-3">
                  <span>Total</span>
                  <span className="text-[#EE8E32]">
                    {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} QAR
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Secure Payment:</strong> Your payment information is encrypted and secure. We use Stripe to process all payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader size="lg" />
            <p className="mt-4 text-gray-600">Loading payment...</p>
          </div>
        </div>
      }
    >
      <PaymentPageInner />
    </Suspense>
  );
}
