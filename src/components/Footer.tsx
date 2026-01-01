"use client";

import Image from "next/image";
import Link from "next/link";
import { MdLocalPhone } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { MdLocationOn } from "react-icons/md";

export default function Footer() {
  return (
    <footer className="w-full bg-[#4c50a2] text-white">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo + Links */}
        <div>
          <div className="flex items-center gap-2 mb-4 md:ms-12">
            <Image src="/icons/logo.svg" alt="Logo" width={40} height={40} />
          </div>
          <ul className="space-y-2 text-sm md:ms-12">
            <li>
              <Link href="#">Contact Us</Link>
            </li>
            <li>
              <Link href="#">Help & Center</Link>
            </li>
          </ul>
        </div>

        {/* Features */}
        <div>
          <h3 className="font-semibold mb-4">Features</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/bidding">Bidding</Link>
            </li>
            <li>
              <Link href="/e-commerce">E-commerce</Link>
            </li>
            <li>
              <Link href="/vendors">Vendors</Link>
            </li>
          </ul>
        </div>

        {/* Contact Info + Social */}
        <div className="md:-ms-22">
          <h3 className="font-semibold mb-4 ">
            Join us social platform to stay updated
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <MdLocalPhone size={16} /> +451 215 215
            </div>
            <div className="flex items-center gap-2">
              <IoMail size={16} /> contact-us@street10.com
            </div>
            <div className="flex items-center gap-2">
              <MdLocationOn size={16} /> 4140 Parker Rd.
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Link href="https://linkedin.com" target="_blank">
              <Image
                src="/icons/lS.svg"
                alt="LinkedIn"
                width={24}
                height={24}
              />
            </Link>
            <Link href="https://facebook.com" target="_blank">
              <Image
                src="/icons/fS.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </Link>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="font-semibold mb-4">
            Receive updates from our weekly newsletter.
          </h3>
          <p className="text-sm mb-4">
            Be the first to get notified about new Street features & updates.
          </p>
          <div className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-2 bg-white rounded-l-md text-black w-full text-sm outline-none"
            />
            <button className="bg-[#ee8e31] text-nowrap px-2 py-2 cursor-pointer rounded-r-md text-sm font-semibold">
              Notify Me
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className=" text-center pb-3 text-sm">
        Copyright ©2023. All right reserved
      </div>
    </footer>
  );
}
