import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function Header() {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
  <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white h-16 flex items-center z-50 shadow-lg">
  <div className="flex w-full items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center space-x-2 text-2xl font-bold">
          <img src="/images/qlogo.png" alt="QMAP Logo" className="h-12 w-12 object-contain" />
          <span className="hidden sm:inline">QMAP</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="hover:text-white/80 transition">
            Dashboard
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-1 hover:text-white/80 transition"
            >
              Customers
              <ChevronDownIcon
                className={`h-4 w-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-black/10 backdrop-blur-md border border-black/20 rounded-lg shadow-lg">
                <Link
                  to="/product-owner-dashboard"
                  className="block px-4 py-2 text-white hover:bg-black/20 transition"
                >
                  Product Owner
                </Link>
                <Link
                  to="/affiliate-dashboard"
                  className="block px-4 py-2 text-white hover:bg-black/20 transition"
                >
                  Affiliate
                </Link>
                {/* <Link
                  to="/admin-dashboard"
                  className="block px-4 py-2 text-white hover:bg-black/20 transition"
                >
                  Admin
                </Link> */}
              </div>
            )}
          </div>

          <Link to="/about" className="hover:text-white/80 transition">
            About
          </Link>
          <Link to="/contact" className="hover:text-white/80 transition">
            Contact
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-white/20 transition"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
     {isMobileMenuOpen && (
        <nav className="md:hidden absolute top-16 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-indigo/30 rounded-b-lg p-4 space-y-2 shadow-lg">
          <Link to="/dashboard" className="block text-black-700 font-semibold hover:text-indigo-900 transition">
            Dashboard
          </Link>
          <Link to="/product-owner-dashboard" className="block text-black-700 font-semibold hover:text-indigo-900 transition">
            Product Owner
          </Link>
          <Link to="/affiliate-dashboard" className="block text-black-700 font-semibold hover:text-indigo-900 transition">
            Affiliate
          </Link>
          {/* <Link to="/admin-dashboard" className="block text-black-700 font-semibold hover:text-indigo-900 transition">
            Admin
          </Link> */}
          <Link to="/about" className="block text-text-white-700 font-semibold hover:text-indigo-900 transition">
            About
          </Link>
          <Link to="/contact" className="block text-white-700 font-semibold hover:text-indigo-900 transition">
            Contact
          </Link>
        </nav>
      )}
    </header>
  );
}
