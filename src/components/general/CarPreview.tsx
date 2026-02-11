"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleMinus } from "react-icons/ci";
import toast from "react-hot-toast";
import AboutCar from "./AboutCar";
import CarInfo from "./CarInfo";
import Address from "./Address";
import { Loader } from "../ui/loader";
import type { Auction } from "@/services/auction.api";
import type { Product } from "@/services/product.api";

interface Car {
  id: number;
  name: string;
  status: "Ready" | "Sold" | "ReadyToBuy" | "Pending" | "Live" | "Ended" | "Settled" | "Scheduled";
  lastBid: string;
  bidder: string;
  timeLeft: string;
  images: string[];
  type?: "auction" | "product"; // auction = bidding product, product = e-commerce/vendor product
  auction?: Auction; // Auction data
  product?: Product; // Product data
  documents?: Array<{
    id: string;
    url: string;
    title: string;
  }>;
  filterValues?: Array<{
    id: string;
    filterId: string;
    value: string;
    filter: {
      id: string;
      key: string;
      type: string;
      iconUrl?: string;
      i18n?: {
        en?: { label: string };
        ar?: { label: string };
      };
    };
  }>;
}

type UserStatus = 'not_logged_in' | 'registered' | 'verification_pending' | 'verified';

const CarPreview: React.FC<{ car: Car }> = ({ car: initialCar }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentCompleted = searchParams?.get('paymentCompleted') === 'true';
  
  // Use local state for car to allow real-time updates
  const [car, setCar] = useState<Car>(initialCar);
  const [selectedImage, setSelectedImage] = useState(initialCar.images[0]);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1=verify/register, 2=deposit, 3=amount
  const [bidStep, setBidStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('not_logged_in');
  const [bidCount, setBidCount] = useState<number>(0);
  const [highestBidder, setHighestBidder] = useState<string>('');
  const [latestBid, setLatestBid] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [auctionEnded, setAuctionEnded] = useState<boolean>(false);
  const [endAtTime, setEndAtTime] = useState<string | null>(initialCar.type === 'auction' && initialCar.auction?.endAt ? initialCar.auction.endAt : null);
  const [lastBidNotificationTime, setLastBidNotificationTime] = useState<number>(0); // Track last notification to prevent duplicates
  
  // Initialize winner info from auction data if available
  const getInitialWinnerInfo = () => {
    if (initialCar.type === 'auction' && initialCar.auction) {
      const auction = initialCar.auction;
      const winningBid = (auction as any).winningBid;
      const reservePriceMet = (auction as any).reservePriceMet;
      const state = auction.state;
      
      // If auction has ended and there's a winning bid with reserve price met
      if ((state === 'ended' || state === 'settled') && winningBid && reservePriceMet !== false) {
        return {
          name: winningBid.bidderName || winningBid.user?.name || winningBid.user?.email?.split('@')[0] || 'Winner',
          userId: winningBid.userId || winningBid.user?.id || '',
        };
      }
    }
    return null;
  };
  
  const [winnerInfo, setWinnerInfo] = useState<{ name: string; userId: string } | null>(getInitialWinnerInfo()); // Store winner information
  // 0=normal images, 1=red preview, 2=number plate preview, 3=back to normal after bid

  // --- Bid increment & minimum bid calculation based on auction data ---
  // Values from backend are in minor units (e.g. 550000 = 5,500.00 QAR)
  const rawMinIncrementMinor =
    car.type === 'auction' && car.auction?.minIncrement
      ? parseFloat(car.auction.minIncrement)
      : 0;

  // Default increment to 100 QAR if not set
  const minIncrementQAR =
    rawMinIncrementMinor > 0 ? rawMinIncrementMinor / 100 : 100;

  // Current winning amount in minor units - use state so it updates in real-time
  const [currentAmountMinor, setCurrentAmountMinor] = useState<number>(
    car.type === 'auction' && car.auction
      ? (() => {
          const a = car.auction;
          const winning = (a as any).winningBid || a.currentBid;
          if (winning && winning.amountMinor) {
            return parseFloat(winning.amountMinor);
          }
          if (a.reservePrice) {
            return parseFloat(a.reservePrice);
          }
          if ((a as any).startingPrice) {
            return parseFloat((a as any).startingPrice);
          }
          return 0;
        })()
      : 0
  );

  // Minimum next bid in QAR (currentAmount + minIncrement)
  const minBidQAR =
    (currentAmountMinor + (rawMinIncrementMinor > 0 ? rawMinIncrementMinor : 0)) /
    100;

  // Quick bid options: start at minimum bid, then add increments
  const quickBidBase =
    minBidQAR && minBidQAR > 0 ? minBidQAR : minIncrementQAR;
  const quickBidOptions = [0, 1, 2, 3].map(
    (i) => Math.round(quickBidBase + i * minIncrementQAR)
  );

  // Check user status on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserStatus('not_logged_in');
        // Non-registered users see step 1 (Register button)
        return;
      }

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.customerType === 'verified') {
            setUserStatus('verified');
            // For verified users, skip step 1 (register/verify) and go to step 2 (deposit) for auctions
            // For e-commerce/vendor products, verified users can interact directly
            if (car.type === 'auction') {
              setStep(2);
            } else {
              // For e-commerce/vendor products, verified users can interact directly
              setStep(3); // Skip to amount selection or buying
            }
          } else if (user.customerType === 'verification_pending') {
            setUserStatus('verification_pending');
            // For registered but not verified users on e-commerce/vendor products, allow interaction
            // Only bidding products require verification
            if (car.type !== 'auction') {
              setStep(3); // Skip verification step for e-commerce/vendor products
            }
            // For bidding products, stay on step 1 to show verify button
          } else {
            setUserStatus('registered');
            // For registered but not verified users on e-commerce/vendor products, allow interaction
            // Only bidding products require verification
            if (car.type !== 'auction') {
              setStep(3); // Skip verification step for e-commerce/vendor products
            }
            // For bidding products, stay on step 1 to show verify button
          }
        } catch (error) {
          console.error("Error parsing user:", error);
          setUserStatus('not_logged_in');
        }
      } else {
        setUserStatus('not_logged_in');
      }
    }
  }, [car.type]);

  // Check if deposit is already paid when component loads (for auctions)
  useEffect(() => {
    const checkDepositStatus = async (retryCount = 0) => {
      if (car.type !== 'auction' || !car.auction?.id || userStatus !== 'verified') {
        return;
      }

      // If payment was just completed, wait longer and retry if needed
      const initialDelay = paymentCompleted ? 2000 : 500; // Longer delay if payment just completed
      const maxRetries = paymentCompleted ? 3 : 0; // Retry up to 3 times if payment just completed

      const delay = setTimeout(async () => {
        try {
          const { auctionApi } = await import('@/services/auction.api');
          if (!car.auction?.id) return;
          const response = await auctionApi.checkDepositStatus(car.auction.id);
          
          // If deposit is already paid, skip to bidding step
          if (response.data?.alreadyPaid) {
            setStep(3);
            setBidStep(0); // Reset bid step to show bidding form
            
            // Remove paymentCompleted parameter from URL after successful check
            if (paymentCompleted) {
              const newUrl = window.location.pathname + window.location.search.replace(/[?&]paymentCompleted=true/, '').replace(/^&/, '?');
              window.history.replaceState({}, '', newUrl || window.location.pathname);
            }
          } else if (retryCount < maxRetries) {
            // Retry checking deposit status (payment might still be processing)
            console.log(`Retrying deposit check (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            setTimeout(() => checkDepositStatus(retryCount + 1), 1000); // Retry after 1 second
          } else if (car.auction?.state === 'live') {
            // Only show deposit step if auction is live and deposit not found after retries
            setStep(2);
          }
        } catch (error: any) {
          // If error is about auction not live, show appropriate message
          if (error?.response?.data?.message?.includes('not live')) {
            // Auction not live - don't show deposit button
            if (car.auction?.state !== 'live') {
              setStep(1); // Show message that auction is not live
            }
          } else if (retryCount < maxRetries) {
            // Retry on error if payment was just completed
            console.log(`Retrying deposit check after error (attempt ${retryCount + 1}/${maxRetries + 1})...`);
            setTimeout(() => checkDepositStatus(retryCount + 1), 1000);
          } else {
            console.log('Deposit check:', error?.response?.data?.message || 'Not checked');
          }
        }
      }, initialDelay);

      return () => clearTimeout(delay);
    };

    checkDepositStatus();
  }, [car.type, car.auction?.id, userStatus, car.auction?.state, paymentCompleted]);

  // Update endAtTime when car.auction.endAt changes
  useEffect(() => {
    if (car.type === 'auction' && car.auction?.endAt) {
      setEndAtTime(car.auction.endAt);
    }
  }, [car.type, car.auction?.endAt]);

  // Real-time countdown timer
  useEffect(() => {
    if (car.type !== 'auction' || !endAtTime) return;

      const updateCountdown = () => {
      // Don't update if already ended
      if (auctionEnded) {
        setTimeLeft('00:00:00');
        return;
      }

      const endDate = new Date(endAtTime);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        setAuctionEnded(true);
        // Check auction state - if ended, disable bidding
        if (car.auction?.state === 'ended' || car.auction?.state === 'settled') {
          setAuctionEnded(true);
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d : ${hours}h : ${minutes}m`);
      } else {
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
      setAuctionEnded(false);
    };

    // Update immediately
    updateCountdown();

    // Update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [car.type, endAtTime, auctionEnded, car.auction?.state]);

  // Sync car prop changes to local state
  useEffect(() => {
    setCar(initialCar);
  }, [initialCar]);

  // WebSocket connection for real-time bidding updates
  useEffect(() => {
    if (car.type !== 'auction' || !car.auction?.id) return;
    
    // Don't connect WebSocket if auction has ended - no need for real-time updates
    if (auctionEnded || car.auction?.state === 'ended' || car.auction?.state === 'settled') {
      return;
    }

    let socket: any = null;
    let isConnected = false;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    const auctionId = car.auction.id; // Capture auction ID to avoid stale closures

    const connectWebSocket = async () => {
      try {
        // Dynamically import socket.io-client
        const { io } = await import('socket.io-client');
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000';
        const wsURL = baseURL.replace('/api/v1', '');

        socket = io(wsURL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
        });

        const joinAuctionRoom = () => {
          if (socket && socket.connected && auctionId) {
            socket.emit('join_auction', auctionId);
            console.log('✅ Joined auction room:', auctionId);
          }
        };

        socket.on('connect', () => {
          console.log('✅ WebSocket connected');
          isConnected = true;
          // Authenticate socket with user ID if available
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              const userId = String(user.id || user.userId || '');
              if (userId) {
                socket.emit('authenticate', userId);
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
          // Join auction room on connect AND reconnect
          joinAuctionRoom();
        });

        socket.on('reconnect', (attemptNumber: number) => {
          console.log(`✅ WebSocket reconnected (attempt ${attemptNumber})`);
          // Rejoin room on reconnect
          joinAuctionRoom();
        });


        socket.on('new_bid', (data: any) => {
          // Update UI with new bid information
          if (data.bid) {
            const bidAmount = parseFloat(data.bid.amountMinor) / 100;
            setLatestBid(`${bidAmount.toLocaleString()} QAR`);
            setHighestBidder(data.bid.bidderName || 'Anonymous');
            if (data.bidCount) {
              setBidCount(data.bidCount);
            }
            // Update endAt time if auto-extend happened
            if (data.endAt) {
              setEndAtTime(data.endAt);
            }
            // Update current amount for minimum bid calculation - THIS FIXES THE BID BUTTON UPDATES
            const newAmountMinor = parseFloat(data.bid.amountMinor);
            setCurrentAmountMinor(newAmountMinor);
            // This will trigger recalculation of minBidQAR and quickBidOptions
            
            // Don't show toast for user's own bid - API call already shows it
            // Only update UI state, no toast notification needed
            // This prevents duplicate notifications
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                const userId = String(user.id || user.userId || '');
                const bidUserId = String(data.bid.userId || '');
                // If this is the current user's bid, skip toast (already shown by API call)
                // Only show toast for other users' bids if needed (currently not showing any)
                if (userId === bidUserId) {
                  // User's own bid - toast already shown by API call, skip WebSocket toast
                  // Just update the last notification time to prevent any duplicates
                  setLastBidNotificationTime(Date.now());
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        });
        
        // Listen for auction status changes
        socket.on('auction_status_changed', (data: any) => {
          console.log('📢 Received auction_status_changed:', data);
          if (data.auctionId === car.auction?.id && data.state) {
            // Calculate status based on state and reservePriceMet
            const calculateStatus = (state: string, reservePriceMet?: boolean) => {
              switch (state) {
                case "scheduled":
                  return "Scheduled";
                case "live":
                  // If reserve price not met, show "Pending", otherwise "Ready"
                  return reservePriceMet === false ? "Pending" : "Ready";
                case "ended":
                  // Check if reserve price was met (if reservePriceMet is false, show "Ended", otherwise check if has bid)
                  return reservePriceMet === false ? "Ended" : "ReadyToBuy";
                case "settled":
                  return "ReadyToBuy";
                default:
                  return "Pending";
              }
            };
            
            // Update car status in real-time - use single state update to ensure re-render
            setCar((prevCar: any) => {
              const reservePriceMet = data.reservePriceMet !== undefined ? data.reservePriceMet : prevCar.auction?.reservePriceMet;
              const order = prevCar.auction?.order || data.order; // Get order from car or event data
              const calculatedStatus = calculateStatus(data.state, reservePriceMet);
              
              // Also check time to ensure status is correct even if backend is slightly delayed
              const now = new Date();
              const endDate = prevCar.auction?.endAt ? new Date(prevCar.auction.endAt) : null;
              let finalStatus = calculatedStatus;
              
              // If time has passed but state is still live, override to ended
              if (data.state === 'live' && endDate && now >= endDate) {
                finalStatus = reservePriceMet === false ? "Ended" : "ReadyToBuy";
              }
              
              // Update winner info if available in event data (from settlement)
              if (data.winner && reservePriceMet !== false) {
                setWinnerInfo({
                  name: data.winner.name || data.winner.email?.split('@')[0] || 'Winner',
                  userId: data.winner.userId || data.winner.id || '',
                });
              } else if (reservePriceMet === false) {
                setWinnerInfo(null);
              }
              
              const updatedCar = {
                ...prevCar,
                auction: {
                  ...prevCar.auction,
                  state: data.state,
                  reservePriceMet: reservePriceMet,
                  order: order || prevCar.auction?.order, // Preserve order if exists
                  winningBid: data.winningBid || prevCar.auction?.winningBid, // Preserve winning bid if exists
                },
                status: finalStatus,
              };
              
              console.log('🔄 Updated car status:', updatedCar.status, 'state:', updatedCar.auction?.state, 'reservePriceMet:', reservePriceMet, 'order:', order, 'winnerInfo:', winnerInfo);
              return updatedCar;
            });
            
            // If auction started (became live), update endAtTime if provided
            if (data.state === 'live' && data.endAt) {
              setEndAtTime(data.endAt);
            }
            
            // If auction ended, trigger the same logic as auction_ended event
            if (data.state === 'ended' || data.state === 'settled') {
              setAuctionEnded(true);
              setTimeLeft('00:00:00');
              
              // If reserve price not met, clear winner info
              if (data.reservePriceMet === false) {
                setWinnerInfo(null);
              }
              
              // Keep step at 3 to show winner message, not verification message
              setStep(3);
              setBidStep(3);
            }
          }
        });
        
        socket.on('auction_state', (data: any) => {
          // Update bid count and current bid from initial state
          if (data.currentBid) {
            const bidAmount = parseFloat(data.currentBid) / 100;
            setLatestBid(`${bidAmount.toLocaleString()} QAR`);
          }
          if (data.bidderName) {
            setHighestBidder(data.bidderName);
          }
          if (data.bidCount !== undefined) {
            setBidCount(data.bidCount);
          }
          // Update endAt time for countdown if provided
          if (data.endAt) {
            // Countdown timer will handle this
          }
          // Check if auction ended
          if (data.state === 'ended' || data.state === 'settled') {
            setAuctionEnded(true);
            setTimeLeft('00:00:00');
          }
        });

        socket.on('auction_ended', (data: any) => {
          console.log('🏁 Received auction_ended event:', data);
          
          // Freeze countdown immediately
          setAuctionEnded(true);
          setTimeLeft('00:00:00');
          
          // Store winner information for display
          // Check multiple possible formats for winner data
          const winner = data.winner || (data.winningBid && data.winningBid.user) || null;
          if (winner && data.reservePriceMet !== false) {
            setWinnerInfo({
              name: winner.name || winner.email?.split('@')[0] || data.winningBid?.bidderName || 'Winner',
              userId: winner.userId || winner.id || data.winningBid?.userId || '',
            });
          } else if (data.reservePriceMet === false) {
            // No winner if reserve price not met
            setWinnerInfo(null);
          } else {
            // Try to get winner from auction data if not in event
            const auction = car.auction;
            const winningBid = (auction as any)?.winningBid;
            if (winningBid) {
              setWinnerInfo({
                name: winningBid.bidderName || winningBid.user?.name || winningBid.user?.email?.split('@')[0] || 'Winner',
                userId: winningBid.userId || winningBid.user?.id || '',
              });
            } else {
              setWinnerInfo(null);
            }
          }
          
          // Update status: "ReadyToBuy" if reserve price met (not "Sold" until fully paid), otherwise "Ended"
          setCar((prevCar: any) => ({
            ...prevCar,
            status: data.reservePriceMet ? 'ReadyToBuy' : 'Ended',
            auction: {
              ...prevCar.auction,
              state: 'ended',
            },
          }));
          
          // Disable bidding by updating step (hide bid form)
          // Keep step at 3 to show winner message, not verification message
          setStep(3);
          setBidStep(3);
          
          // Check if current user is winner
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              // Convert user.id to string for comparison (it might be number or string)
              const userId = String(user.id || user.userId || '');
              const winnerUserId = data.winner ? String(data.winner.userId || '') : '';
              
              console.log('👤 Current user ID:', userId, 'Winner ID:', winnerUserId);
              
              if (data.winner && userId === winnerUserId) {
                // User won - show notification (TopHeader will show banner)
                console.log('🎉 User won! Showing notification...');
                setTimeout(() => {
                  toast.success('🎉 Congratulations! You won the auction! Please submit deposit or final payment within the settlement period, or visit the office.', { 
                    duration: 8000,
                    style: {
                      fontSize: '16px',
                      padding: '16px',
                    }
                  });
                }, 500);
                // Don't redirect - user can proceed via TopHeader banner or order history
              } else if (data.winner) {
                // Someone else won
                setTimeout(() => {
                  toast('Auction ended. You did not win this auction.');
                }, 500);
              } else if (data.reservePriceMet === false) {
                // No winner (reserve price not met)
                setTimeout(() => {
                  toast('Auction ended. No winner - reserve price was not met. All bids have been released.');
                }, 500);
              } else {
                // Auction ended but no winner for other reasons
                setTimeout(() => {
                  toast('Auction ended.');
                }, 500);
              }
            } catch (error) {
              console.error('Error parsing user:', error);
            }
          } else {
            // User not logged in - just show message
            setTimeout(() => {
              if (data.reservePriceMet === false) {
                toast('Auction ended. No winner - reserve price was not met.');
              } else if (data.winner) {
                toast('Auction ended.');
              }
            }, 500);
          }
        });

        // Listen for winner-specific event (more reliable than checking in auction_ended)
        socket.on('auction_won', (data: any) => {
          console.log('🎉 Received auction_won event:', data);
          if (data.orderId) {
            setTimeout(() => {
              toast.success('🎉 Congratulations! You won the auction! Please submit deposit or final payment within the settlement period, or visit the office.', { 
                duration: 8000,
                style: {
                  fontSize: '16px',
                  padding: '16px',
                }
              });
            }, 500);
            // Don't redirect - user can proceed via TopHeader banner or order history
          }
        });

        socket.on('disconnect', (reason: string) => {
          console.log('⚠️ WebSocket disconnected:', reason);
          isConnected = false;
        });

        socket.on('connect_error', (error: any) => {
          console.error('❌ WebSocket connection error:', error);
          isConnected = false;
        });
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (socket) {
        socket.emit('leave_auction', auctionId);
        socket.removeAllListeners(); // Remove all listeners to prevent memory leaks
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [car.type, car.auction?.id, auctionEnded]); // Only reconnect if auction ID changes or auction ends

  const handlePlaceBid = async () => {
    // Check if auction has ended
    if (auctionEnded) {
      alert('This auction has ended. Bidding is no longer allowed.');
      return;
    }

    // Check auction state
    if (car.auction?.state && car.auction.state !== 'live') {
      alert(`Auction is not live. Current status: ${car.auction.state}. Bidding is not allowed.`);
      return;
    }

    // Check if user is verified
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.customerType !== 'verified') {
            alert("Please verify your account first to place bids. You will be redirected to the verification page.");
            window.location.href = "/upload-cnic";
            return;
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      } else {
        alert("Please login to place bids");
        window.location.href = "/login";
        return;
      }
    }

    if (!car.auction?.id) {
      alert('Auction information not available');
      return;
    }

    // Get bid amount from selected amount or input
    const bidAmount = selectedAmount || 0;
    // Enforce backend minimum bid on the frontend (convert to QAR)
    const effectiveMinBid = minBidQAR && minBidQAR > 0 ? minBidQAR : minIncrementQAR;
    if (bidAmount < effectiveMinBid) {
      alert(
        `Bid amount must be at least ${effectiveMinBid.toFixed(
          0
        )} QAR (current minimum bid)`
      );
      return;
    }

    setLoading(true);
    try {
      const { auctionApi } = await import('@/services/auction.api');
      const amountMinor = Math.round(bidAmount * 100); // Convert to minor units

      // Place bid via API
      const response = await auctionApi.placeBid(car.auction.id, {
        amountMinor,
      });

      if (response.success) {
        // Bid placed successfully
        // Update local state immediately
        const bidAmountQAR = parseFloat(response.data.bid.amountMinor) / 100;
        setLatestBid(`${bidAmountQAR.toLocaleString()} QAR`);
        
        // Update current amount for minimum bid calculation
        setCurrentAmountMinor(amountMinor);
        
        // Get current user name for display
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setHighestBidder(user.name || user.email?.split('@')[0] || 'You');
          } catch (error) {
            setHighestBidder('You');
          }
        }
        
        // Show success message immediately
        // Update lastBidNotificationTime to prevent WebSocket duplicate
        const now = Date.now();
        setLastBidNotificationTime(now);
        toast.success(`✅ Bid placed successfully! ${bidAmountQAR.toLocaleString()} QAR`, {
          id: `bid-api-${now}`, // Unique ID based on timestamp
        });
        
        // Real-time updates will come via WebSocket
        setBidStep(3);
        setStep(3);
      } else {
        alert('Failed to place bid. Please try again.');
      }
    } catch (error: any) {
      console.error('Bid placement error:', error);
      const errorMessage = error?.response?.data?.error?.message || error?.message || 'Failed to place bid';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Use window.location.href for faster navigation to signup page
    window.location.href = '/signup';
  };

  const handleVerify = async () => {
    // Use window.location.href for faster navigation to verification page
    window.location.href = '/upload-cnic';
  };

  const handlePayDeposit = async () => {
    if (!car.auction?.id) {
      toast.error('Auction ID is missing');
      return;
    }

    // Check if auction is live before attempting to pay deposit
    if (car.auction?.state !== 'live') {
      const stateMessage = car.auction?.state === 'scheduled' 
        ? 'This auction is scheduled and has not started yet. Please wait for the auction to go live.'
        : car.auction?.state === 'ended' || car.auction?.state === 'settled'
        ? 'This auction has ended. Deposits can only be paid for live auctions.'
        : `This auction is not live. Current status: ${car.auction?.state}. You can only pay deposit for live auctions.`;
      toast.error(stateMessage, { duration: 6000 });
      return;
    }

    setLoading(true);
    try {
      const { auctionApi } = await import('@/services/auction.api');
      const response = await auctionApi.payDeposit(car.auction.id);
      
      if (response.success && response.data?.clientSecret) {
        // Redirect to payment page with deposit details
        const depositAmount = car.auction?.depositAmount 
          ? parseFloat(car.auction.depositAmount).toString()
          : '20000'; // Default 200 QAR in minor units
        
        // Include paymentIntentId so we can confirm deposit after Stripe payment succeeds
        const params = new URLSearchParams({
          type: 'deposit',
          auctionId: car.auction.id,
          clientSecret: response.data.clientSecret,
          amount: depositAmount,
        });
        if (response.data.paymentIntentId) {
          params.append('paymentIntentId', response.data.paymentIntentId);
        }
        
        window.location.href = `/payment?${params.toString()}`;
      } else if (response.data?.alreadyPaid) {
        // Deposit already paid, proceed to bidding
        setStep(3);
        alert('Deposit already paid. You can now place bids.');
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error: any) {
      console.error('Error paying deposit:', error);
      // Backend returns error in error.error.message structure
      const errorMessage = error?.response?.data?.error?.message 
        || error?.response?.data?.message 
        || error?.message 
        || 'Failed to process deposit payment.';
      
      // Show user-friendly error message using toast
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {bidStep != 5 ? (
        <>
          <div className="flex flex-col lg:flex-row gap-6  p-6 rounded-lg items-stretch">
            {/* Left Thumbnails (only show in step 0 and after bid complete) */}
            {(bidStep === 0 || bidStep === 3 || bidStep === 4) && (
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] flex-shrink-0">
                {car.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`min-w-[140px] min-h-[140px] lg:w-28 lg:h-28 cursor-pointer rounded-md overflow-hidden border-2
                ${
                  selectedImage === img
                    ? "border-[#ee8e31]"
                    : "border-transparent"
                }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`Car ${idx + 1}`}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Main Preview */}
            <div className="flex-1 rounded-lg overflow-hidden shadow flex items-center justify-center bg-white h-110">
              {(bidStep === 0 || bidStep === 3 || bidStep === 4) && (
                <Image
                  src={selectedImage}
                  alt="Selected Car"
                  width={600}
                  height={500}
                  className="w-full h-110"
                />
              )}

              {bidStep === 1 && (
                <div className="w-full h-110 flex items-center justify-center bg-red-600">
                  <Image
                    src="/images/street/phoneNumber.png"
                    alt="phone"
                    width={250}
                    height={250}
                  />
                </div>
              )}

              {bidStep === 2 && (
                <div className="w-full h-110 flex items-center justify-center bg-[#8D1C3D]">
                  <Image
                    src="/images/street/numberPlate.png"
                    alt="plate"
                    width={250}
                    height={250}
                  />
                </div>
              )}
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-[650px] flex flex-col justify-between p-6">
              <div>
                <h2 className="text-lg lg:text-2xl font-semibold">
                  {bidStep < 1
                    ? car.name
                    : bidStep == 1
                    ? "Phone number 123-4567-#"
                    : bidStep == 3 || bidStep == 4
                    ? car.name
                    : "Plate no. 12345#"}
                  <span
                    className={`text-sm font-medium ms-4 ${
                      car.status === "Ready" || car.status === "Live"
                        ? "text-[#038001]"
                        : car.status === "Sold" || car.status === "ReadyToBuy" || car.status === "Ended" || car.status === "Settled"
                        ? "text-red-600"
                        : car.status === "Scheduled"
                        ? "text-blue-600"
                        : "text-[#ee8e31]"
                    }`}
                  >
                    <span className="text-xl">●</span>{" "}
                    {bidStep == 4 ? "3 cars left" : car.status}
                  </span>
                </h2>
                {bidStep !== 4 && (
                  <>
                    <p className="text-sm text-[#000000] my-6">
                      Last Bid:{" "}
                      <span className="text-[#038001] ms-1 font-medium bg-[#e8f3e9] p-2 rounded-xl">
                        {latestBid || car.lastBid} {highestBidder ? `by @${highestBidder}` : `by @${car.bidder}`}
                      </span>
                      {bidCount > 0 && (
                        <span className="text-xs text-gray-600 ms-2">
                          ({bidCount} {bidCount === 1 ? 'bid' : 'bids'})
                        </span>
                      )}
                    </p>

                    <p className="text-md flex gap-3 text-[#000000] mt-1 bg-white rounded-xl shadow p-5">
                      <Image
                        src="/icons/clock.svg"
                        width={18}
                        height={18}
                        alt="clock"
                      />
                      {timeLeft || car.timeLeft} {auctionEnded ? 'Ended' : 'Left'}
                    </p>
                  </>
                )}

                {/* Step Flow - Show Register/Verify button for non-verified users */}
                {step === 1 && (
                  <div className="bg-white rounded-xl shadow py-7 px-5 mt-3">
                    {/* If auction has ended, show appropriate message instead of verify button */}
                    {auctionEnded || car.auction?.state === 'ended' || car.auction?.state === 'settled' ? (
                      <div className="text-center py-4">
                        {/* If there's a winner (reserve price met), show winner message */}
                        {winnerInfo && car.auction?.reservePriceMet !== false ? (
                          <p className="text-green-600 font-medium">
                            This auction has ended. <span className="font-bold">{winnerInfo.name}</span> has won this auction.
                          </p>
                        ) : car.auction?.reservePriceMet === false || (car.status === 'Ended' && !winnerInfo) ? (
                          <p className="text-red-600 font-medium">This auction has ended. No winner - reserve price was not met.</p>
                        ) : (
                          <p className="text-red-600 font-medium">This auction has ended. Bidding is no longer allowed.</p>
                        )}
                      </div>
                    ) : userStatus === 'not_logged_in' ? (
                      <>
                        <p className="text-gray-700 text-sm mb-3">
                          You must register first to interact with this product
                        </p>
                        <button
                          onClick={handleRegister}
                          className="bg-[#ee8e31] cursor-pointer text-white w-full py-3 rounded-lg font-semibold hover:bg-[#d67d1a] transition-colors flex items-center justify-center gap-2"
                        >
                          Register
                        </button>
                      </>
                    ) : (
                      // For registered but not verified users - show verify button only for bidding products
                      car.type === 'auction' && (
                        <>
                          <p className="text-gray-700 text-sm mb-3">
                            You must verify your account first to bid on this item
                          </p>
                          <button
                            onClick={handleVerify}
                            className="bg-[#ee8e31] cursor-pointer text-white w-full py-3 rounded-lg font-semibold hover:bg-[#d67d1a] transition-colors flex items-center justify-center gap-2"
                          >
                            Verify account
                          </button>
                        </>
                      )
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="bg-white rounded-xl shadow py-7 px-5 mt-3">
                    {/* If auction has ended, show appropriate message instead of deposit message */}
                    {auctionEnded || car.auction?.state === 'ended' || car.auction?.state === 'settled' ? (
                      <div className="text-center py-4">
                        {/* If there's a winner (reserve price met), show winner message */}
                        {winnerInfo && car.auction?.reservePriceMet !== false ? (
                          <p className="text-green-600 font-medium">
                            This auction has ended. <span className="font-bold">{winnerInfo.name}</span> has won this auction.
                          </p>
                        ) : car.auction?.reservePriceMet === false || (car.status === 'Ended' && !winnerInfo) ? (
                          <p className="text-red-600 font-medium">This auction has ended. No winner - reserve price was not met.</p>
                        ) : (
                          <p className="text-red-600 font-medium">This auction has ended. Bidding is no longer allowed.</p>
                        )}
                      </div>
                    ) : car.auction?.state !== 'live' ? (
                      <div className="text-center py-4">
                        <p className="text-gray-700 text-sm mb-2">
                          {car.auction?.state === 'scheduled' 
                            ? 'This auction is scheduled and has not started yet. Please wait for the auction to go live before paying the deposit.'
                            : `This auction is not live. Current status: ${car.auction?.state}. You can only pay deposit for live auctions.`}
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 text-sm mb-3">
                          You have to pay a deposit to be able to bid on any item
                        </p>
                        <button
                          onClick={handlePayDeposit}
                          disabled={loading}
                          className="bg-[#ee8e31] cursor-pointer text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader size="sm" color="#ffffff" /> : null}
                          {loading ? "Processing..." : (() => {
                            // Get deposit amount from auction (stored in minor units as string)
                            const depositAmount = car.auction?.depositAmount 
                              ? (parseFloat(car.auction.depositAmount) / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                              : '200';
                            return `Pay Deposit (${depositAmount} QAR)`;
                          })()}
                        </button>
                      </>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div className="bg-white rounded-xl shadow py-7 px-5 mt-3">
                    {auctionEnded || car.auction?.state === 'ended' || car.auction?.state === 'settled' ? (
                      <div className="text-center py-4">
                        {/* If there's a winner (reserve price met), show winner message */}
                        {winnerInfo && car.auction?.reservePriceMet !== false ? (
                          <p className="text-green-600 font-medium">
                            This auction has ended. <span className="font-bold">{winnerInfo.name}</span> has won this auction.
                          </p>
                        ) : car.auction?.reservePriceMet === false || (car.status === 'Ended' && !winnerInfo) ? (
                          <p className="text-red-600 font-medium">This auction has ended. No winner - reserve price was not met.</p>
                        ) : (
                          <p className="text-red-600 font-medium">This auction has ended. Bidding is no longer allowed.</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <p className="mb-3 font-medium text-[#000000]">
                          Select amount
                        </p>
                        <div className="flex gap-3 flex-wrap mb-4">
                          {quickBidOptions.map((amt) => (
                            <span
                              key={amt}
                              onClick={() => setSelectedAmount(amt)}
                              className={`px-4 py-2 rounded-full cursor-pointer hover:bg-[#ee8e31] hover:text-white text-sm transition ${
                                selectedAmount === amt
                                  ? "bg-[#ee8e31] text-white"
                                  : "bg-[#fdf4eb] text-[#ee8e31]"
                              }`}
                            >
                              {amt} QAR
                            </span>
                          ))}
                        </div>

                        <p className="text-[#000000] text-md mb-2">
                          Or Enter custom amount (QAR)
                        </p>
                        <input
                          type="number"
                          placeholder="Enter Amount"
                          value={selectedAmount || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setSelectedAmount(value);
                            } else if (e.target.value === '') {
                              setSelectedAmount(null);
                            }
                          }}
                          className="w-full border border-[#ebe4e4] rounded-lg p-2 mb-2"
                          disabled={auctionEnded || car.auction?.state === 'ended' || car.auction?.state === 'settled'}
                        />
                        <p className="text-[#666666] text-md my-3">
                          {`Must be at least ${(
                            (minBidQAR && minBidQAR > 0 ? minBidQAR : minIncrementQAR) || 0
                          ).toFixed(0)} QAR`}
                        </p>
                        <button
                          onClick={handlePlaceBid}
                          disabled={loading || auctionEnded || car.auction?.state === 'ended' || car.auction?.state === 'settled'}
                          className="bg-[#ee8e31] cursor-pointer text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {loading ? <Loader size="sm" color="#ffffff" /> : null}
                          {loading ? "Placing bid..." : "Place your bid"}
                        </button>
                      </>
                    )}
                  </div>
                )}
                {bidStep === 4 && (
                  <>
                    <div className="flex gap-2 justify-between items-center">
                      <div className="flex gap-2 justify-between items-center mt-2">
                        <CiCircleMinus className="cursor-pointer text-2xl text-[#ee8e31]" />

                        <p className="font-semibold text-lg">2</p>
                        <CiCirclePlus className="cursor-pointer text-2xl text-[#ee8e31]" />
                      </div>
                      <p className="text-lg font-semibold text-[#ee8e31]">
                        600 QAR
                      </p>
                    </div>

                    <div className="p-5 bg-white rounded-xl mt-5">
                      <p className="text-[#000000] text-md mb-2 font-medium">
                        About this item
                      </p>
                      <p className="text-[#666666] text-sm">
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the
                        industry&apos;s standard dummy text ever since the
                        1500s,
                      </p>
                    </div>

                    <div className="px-5 py-8 bg-white rounded-xl mt-8">
                      <button
                        onClick={handlePlaceBid}
                        disabled={loading}
                        className="bg-[#ee8e31] cursor-pointer text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader size="sm" color="#ffffff" /> : null}
                        {loading ? "Processing..." : "Buy now for 600 QAR"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <CarInfo documents={car.documents || []} description={car.product?.description || car.auction?.product?.description || ""} />
          {(bidStep == 0 || bidStep == 3 || bidStep == 4) && <AboutCar filterValues={car.filterValues || []} />}
          {(bidStep == 0 || bidStep == 3 || bidStep == 4) && car.type === 'auction' && car.auction?.id && (
            <SimilarProductsSection auctionId={car.auction.id} />
          )}
        </>
      ) : (
        <Address />
      )}
    </div>
  );
};

// Similar Products Section Component
const SimilarProductsSection: React.FC<{ auctionId: string }> = ({ auctionId }) => {
  const [similarProducts, setSimilarProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        const { auctionApi } = await import('@/services/auction.api');
        const response = await auctionApi.getSimilarProducts(auctionId, 3);
        if (response.success && response.data?.products) {
          setSimilarProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching similar products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProducts();
  }, [auctionId]);

  const handleProductClick = (auctionId: string) => {
    if (!auctionId) {
      console.error('Auction ID is missing');
      return;
    }
    window.location.href = `/car-preview?id=${auctionId}&type=auction`;
  };

  // Get filter label helper
  const getFilterLabel = (filterValue: any): string => {
    if (!filterValue?.filter) return filterValue?.value || '';
    const i18n = filterValue.filter.i18n;
    if (i18n?.en?.label) return i18n.en.label;
    return filterValue.filter.key || filterValue.value || '';
  };

  return (
    <div className="bg-white mx-5 px-5 pt-5 pb-10 rounded-2xl mt-6">
      <h2 className="font-semibold text-xl pb-5">Bidder also offer similar products</h2>
      
      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-[280px] bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : similarProducts.length === 0 ? null : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {similarProducts.map((product) => {
            const price = parseFloat(product.priceMinor || '0') / 100;
            const imageUrl = product.media?.[0]?.url || "/images/cars/car-1.jpg";
            const firstThreeFilters = (product.filterValues || []).slice(0, 3);

            return (
              <div
                key={product.auctionId || product.id}
                onClick={() => handleProductClick(product.auctionId)}
                className="flex-shrink-0 w-[280px] bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
              >
                {/* Product Image */}
                <div className="relative w-full h-48 bg-gray-200">
                  <Image
                    src={imageUrl}
                    alt={product.title || "Product"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/images/cars/car-1.jpg";
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Row 1: Product Name and Starting Price */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm flex-1 truncate">
                      {product.title || "Product"}
                    </h3>
                    <p className="text-lg font-bold text-[#ee8e31] whitespace-nowrap">
                      {price.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} QAR
                    </p>
                  </div>
                  
                  {/* Row 2: First Three Filters */}
                  {firstThreeFilters.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                      {firstThreeFilters.map((filterValue: any, index: number) => (
                        <span key={filterValue.id || index} className="truncate">
                          {filterValue.value}
                          {index < firstThreeFilters.length - 1 && <span className="mx-1">•</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CarPreview;
