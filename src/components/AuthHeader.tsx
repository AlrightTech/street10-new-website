"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const isSignupPage = pathname === "/signup";

  return (
    <div className=" flex items-center justify-between px-10  bg-white w-full">
      <Link href="/">
        <Image src="/icons/logo.svg" alt="Logo" width={50} height={50} />
      </Link>

      {!isSignupPage && (
        <Link
          href="/signup"
          className="bg-[#ee8e31]  cursor-pointer text-white px-8 py-3 rounded-md font-semibold  transition"
        >
          Join Us
        </Link>
      )}
    </div>
  );
}
