"use client";

import { useState, useEffect, useRef } from "react";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { resetUser } from "@/redux/authSlice";
import { toast } from "react-hot-toast";
import { settingsApi } from "@/services/settings.api";

const languages = [
  { code: "en", name: "English", flag: "https://flagcdn.com/w80/gb.png" },
  { code: "ur", name: "Urdu", flag: "https://flagcdn.com/w80/pk.png" },
  { code: "fr", name: "French", flag: "https://flagcdn.com/w80/fr.png" },
  { code: "de", name: "German", flag: "https://flagcdn.com/w80/de.png" },
  { code: "ar", name: "Arabic", flag: "https://flagcdn.com/w80/sa.png" },
];

const Header = () => {
  // const fName = useSelector((state: RootState) => state.user?.first_name);
  // const lName = useSelector((state: RootState) => state.user?.last_name);

  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [logoUrl, setLogoUrl] = useState<string>("/icons/logo.svg");
  const langRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname === "/") return "Home";
    if (pathname === "/bidding") return "Auction";
    if (pathname === "/e-commerce") return "E-commerce";
    if (pathname === "/vendors" || pathname === "/vendor") return "Vendors";
    return "";
  };

  const activeTab = getActiveTab();

  // Function to check and update auth state
  const checkAuthState = () => {
    if (typeof window === "undefined") return;
    
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (userStr && token) {
      try {
        const userData = JSON.parse(userStr);
        setIsLoggedIn(true);
        setUserRole(userData.role || null);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  };

  useEffect(() => {
    // Fetch logo from API
    const fetchLogo = async () => {
      try {
        const settings = await settingsApi.getPublicSettings();
        if (settings?.logos?.websiteLogo) {
          setLogoUrl(settings.logos.websiteLogo);
        }
      } catch (error) {
        console.error("Failed to fetch logo:", error);
      }
    };

    fetchLogo();

    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    // Check authentication state on mount
    checkAuthState();

    // Listen for localStorage changes (e.g., from other tabs or after registration)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === "token") {
        checkAuthState();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Listen for custom auth state change events (from same tab)
    const handleAuthChange = () => {
      checkAuthState();
    };
    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  // Re-check auth state when pathname changes (e.g., after redirect from signup)
  useEffect(() => {
    checkAuthState();
  }, [pathname]);

  const handleLogoutClick = () => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Reset Redux state
    dispatch(resetUser());
    
    // Dispatch custom event to notify other components of auth state change
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("authStateChanged"));
    }
    
    // Show success message
    toast.success("Logged out successfully");
    setIsLoggedIn(false);
    setUserRole(null);
    
    // Redirect to login
    window.location.href = "/login";
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white shadow-sm ">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Mobile Menu */}
        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <button type="button" aria-label="Open menu">
                <HiOutlineMenuAlt1 className="h-6 w-6 text-gray-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-white">
              <nav className="flex flex-col space-y-4 px-4 pt-5 text-gray-700  text-lg font-semibold">
                {["Home", "Auction", "E-commerce", "Vendors"].map((item) => {
                  const href = item === "Home"
                    ? "/"
                    : item === "Auction"
                    ? "/bidding"
                    : `/${item.toLowerCase().replace(/\s+/g, "-")}`;
                  return (
                    <a
                      key={item}
                      href={href}
                      onClick={(e) => {
                        e.preventDefault();
                        setDrawerOpen(false);
                        window.location.href = href;
                      }}
                      className={`hover:text-[#EE8E32] cursor-pointer transition ${
                        activeTab === item ? "text-[#EE8E32]" : ""
                      }`}
                    >
                      {item}
                    </a>
                  );
                })}

                {/* Language Selector - Mobile Only */}

                <div className="lg:hidden mt-6">
                  <p className="text-lg font-semibold text-gray-600 mb-2">
                    Language
                  </p>
                  <div className="flex flex-col gap-2">
                    {languages.map((lang) => (
                      <div
                        key={lang.code}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                          selectedLang.code === lang.code ? "bg-gray-100" : ""
                        }`}
                        onClick={() => {
                          setSelectedLang(lang);
                          setDrawerOpen(false); // 👈 sheet close
                        }}
                      >
                        <Image
                          src={lang.flag}
                          alt={lang.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                        <span className="text-sm">{lang.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Join Us Button - Mobile Only (only when not logged in) */}
                {pathname === "/" && !isLoggedIn && (
                  <button
                    onClick={() => {
                      setDrawerOpen(false);
                      window.location.href = "/signup";
                    }}
                    className="mt-6 cursor-pointer rounded-md bg-[#ee8e31] px-4 py-2 text-white font-medium shadow  transition lg:hidden"
                  >
                    Join Us
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/";
          }}
        >
          <Image 
            src={logoUrl} 
            alt="Logo" 
            width={55} 
            height={55} 
            className="cursor-pointer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/icons/logo.svg";
            }}
          />
        </a>

        {/* Language Selector */}
        <div
          ref={langRef}
          className="hidden lg:flex ms-10 relative items-center gap-2 cursor-pointer"
        >
          <Image
            src={selectedLang.flag}
            alt={selectedLang.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-gray-700 object-cover"
            unoptimized
          />
          <span
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center text-lg font-semibold "
          >
            {selectedLang.name}
            <Image
              src={"/icons/downArrow.svg"}
              alt="icon"
              width={10}
              height={10}
              className="ms-3"
            />
          </span>
          {langOpen && (
            <div className="absolute top-9 left-0 z-50 w-40 rounded-md border bg-white shadow-lg">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-lg font-medium"
                  onClick={() => {
                    setSelectedLang(lang);
                    setLangOpen(false);
                  }}
                >
                  <Image
                    src={lang.flag}
                    alt={lang.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center / Right Navigation */}
      <div className="flex-1 flex justify-end gap-10 me-16">
        <nav className="hidden lg:flex items-center gap-8 text-lg font-semibold">
          {["Home", "Auction", "E-commerce", "Vendors"].map((item) => {
            const href = item === "Home"
              ? "/"
              : item === "Auction"
              ? "/bidding"
              : `/${item.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <a
                key={item}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = href;
                }}
                className={`cursor-pointer transition ${
                  activeTab === item
                    ? "text-[#EE8E32]"
                    : "text-black hover:text-[#EE8E32]"
                }`}
              >
                {item}
              </a>
            );
          })}
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <a
          href="/bidding"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/bidding";
          }}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 cursor-pointer hover:bg-gray-200 transition">
            <Image
              className="w-5 h-5 "
              src={"/icons/search.svg"}
              alt={"icon"}
              width={20}
              height={20}
            />
          </div>
        </a>

        <div ref={bellRef} className="relative">
          <div
            onClick={() => setBellOpen(!bellOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 cursor-pointer"
          >
            <Image
              className="w-5 h-5 "
              src={"/icons/bell.svg"}
              alt={"icon"}
              width={20}
              height={20}
            />
          </div>
          {bellOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-md shadow-lg p-3 text-sm z-50">
              <p className="text-gray-600">No new notifications</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={(e) => {
              const token = localStorage.getItem("token");
              const userStr = localStorage.getItem("user");

              if (!token || !userStr) {
                e.preventDefault();
                toast.error("Please login to view your profile");
                window.location.href = "/login";
                return;
              }

              try {
                const userData = JSON.parse(userStr);
                // If user is a vendor, send them to admin panel profile page
                if (userData.role === "vendor") {
                  // Log out from website context as vendor will manage account in admin panel
                  localStorage.removeItem("token");
                  localStorage.removeItem("user");
                  setIsLoggedIn(false);
                  setUserRole(null);

                  const baseUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
                  if (!baseUrl) {
                    toast.error("Admin URL is not configured. Set NEXT_PUBLIC_ADMIN_URL in website .env.");
                    window.location.href = "/login";
                    return;
                  }
                  window.location.href = `${baseUrl}/settings/profile`;
                } else {
                  // Normal customers go to customer profile page
                  window.location.href = "/profile";
                }
              } catch (error) {
                console.error("Failed to parse user from localStorage:", error);
                window.location.href = "/login";
              }
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 cursor-pointer"
          >
            <Image
              className="w-6 h-6 "
              src={"/icons/profile.svg"}
              alt={"icon"}
              width={20}
              height={20}
            />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md border bg-white shadow-lg p-3 z-50">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-3 border-b pb-2 mb-2">
                  <Image
                    className="w-7 h-7 "
                    src={"/icons/profile.svg"}
                    alt={"icon"}
                    width={20}
                    height={20}
                  />
                  <p className="text-sm font-medium text-black">Jon Do</p>
                </div>
              </a>
              <button 
                onClick={handleLogoutClick}
                className="flex w-full items-center justify-between rounded-md p-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100"
              >
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
        {/* Join Us Button - Desktop (only when not logged in) */}
        {pathname === "/" && !isLoggedIn && (
          <button
            onClick={() => {
              window.location.href = "/signup";
            }}
            className="hidden lg:inline-block ms-12 cursor-pointer rounded-md bg-[#ee8e31] px-4 py-2 text-white font-medium shadow transition"
          >
            Join Us
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
