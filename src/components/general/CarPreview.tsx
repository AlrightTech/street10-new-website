"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CiCirclePlus } from "react-icons/ci";
import { CiCircleMinus } from "react-icons/ci";
import AboutCar from "./AboutCar";
import CarInfo from "./CarInfo";
import Address from "./Address";
import { Loader } from "../ui/loader";
import type { Auction } from "@/services/auction.api";
import type { Product } from "@/services/product.api";

interface Car {
  id: number;
  name: string;
  status: "Ready" | "Sold" | "Pending" | "Live" | "Ended" | "Settled";
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

const CarPreview: React.FC<{ car: Car }> = ({ car }) => {
  const [selectedImage, setSelectedImage] = useState(car.images[0]);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1=verify/register, 2=deposit, 3=amount
  const [bidStep, setBidStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [loading, setLoading] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus>('not_logged_in');
  // 0=normal images, 1=red preview, 2=number plate preview, 3=back to normal after bid

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

  const handlePlaceBid = async () => {
    // Check if user is verified
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.customerType !== 'verified') {
            // Show verification required message
            alert("Please verify your account first to place bids. You will be redirected to the verification page.");
            // Use window.location.href for faster navigation
            window.location.href = "/upload-cnic";
            return;
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      } else {
        alert("Please login to place bids");
        // Use window.location.href for faster navigation
        window.location.href = "/login";
        return;
      }
    }

    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (bidStep === 0) {
      setBidStep(1);
    } else if (bidStep === 1) {
      setBidStep(2);
    } else if (bidStep === 2) {
      setBidStep(3);
    } else if (bidStep === 3) {
      setBidStep(4);
      setStep(4);
    } else if (bidStep === 4) {
      setBidStep(5);
      setStep(5);
    }
    setLoading(false);
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
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStep(3);
    setLoading(false);
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
                        : car.status === "Sold" || car.status === "Ended" || car.status === "Settled"
                        ? "text-red-600"
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
                        {car.lastBid} by @{car.bidder}
                      </span>
                    </p>

                    <p className="text-md flex gap-3 text-[#000000] mt-1 bg-white rounded-xl shadow p-5">
                      <Image
                        src="/icons/clock.svg"
                        width={18}
                        height={18}
                        alt="clock"
                      />
                      {car.timeLeft} Left
                    </p>
                  </>
                )}

                {/* Step Flow - Show Register/Verify button for non-verified users */}
                {step === 1 && (
                  <div className="bg-white rounded-xl shadow py-7 px-5 mt-3">
                    {userStatus === 'not_logged_in' ? (
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
                  </div>
                )}

                {step === 3 && (
                  <div className="bg-white rounded-xl shadow py-7 px-5 mt-3">
                    <p className="mb-3 font-medium text-[#000000]">
                      Select amount
                    </p>
                    <div className="flex gap-3 flex-wrap mb-4">
                      {[600, 700, 800, 900].map((amt) => (
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
                      className="w-full border border-[#ebe4e4] rounded-lg p-2 mb-2"
                    />
                    <p className="text-[#666666] text-md my-3">
                      Must be 100+ e.g. 600, 700, 800... 100000
                    </p>
                    <button
                      onClick={handlePlaceBid}
                      disabled={loading}
                      className="bg-[#ee8e31] cursor-pointer text-white w-full py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader size="sm" color="#ffffff" /> : null}
                      {loading ? "Placing bid..." : "Place your bid"}
                    </button>
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
        </>
      ) : (
        <Address />
      )}
    </div>
  );
};

export default CarPreview;
