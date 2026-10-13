import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white relative w-full">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo & About */}
        <div className="flex flex-col items-center md:items-start space-y-4">
          <img src="/images/qlogo.png" alt="QMAP Logo" className="h-14 w-14 object-contain" />
          <p className="text-white/80 text-center md:text-left leading-relaxed">
            QMAP helps businesses grow globally through affiliate marketing and innovative solutions.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-2 items-center md:items-start">
          <h3 className="font-semibold text-lg mb-2">Quick Links</h3>
          <a href="/dashboard" className="hover:underline hover:text-white/80 transition">Dashboard</a>
          <a href="/about" className="hover:underline hover:text-white/80 transition">About</a>
          <a href="/contact" className="hover:underline hover:text-white/80 transition">Contact</a>
          <a href="/login" className="hover:underline hover:text-white/80 transition">Login</a>
        </div>

        {/* Support */}
        <div className="flex flex-col space-y-2 items-center md:items-start">
          <h3 className="font-semibold text-lg mb-2">Support</h3>
          <a href="#" className="hover:underline hover:text-white/80 transition">Help Center</a>
          <a href="#" className="hover:underline hover:text-white/80 transition">FAQ</a>
          <a href="#" className="hover:underline hover:text-white/80 transition">Terms & Conditions</a>
          <a href="#" className="hover:underline hover:text-white/80 transition">Privacy Policy</a>
        </div>

        {/* Socials & Contact */}
        <div className="flex flex-col items-center md:items-end space-y-4">
          <h3 className="font-semibold text-lg mb-2">Follow Us</h3>
          <div className="flex space-x-4">
            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition">
              <FaLinkedinIn className="text-lg text-white" />
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition">
              <FaTwitter className="text-lg text-white" />
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition">
              <FaFacebookF className="text-lg text-white" />
            </a>
            <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition">
              <FaInstagram className="text-lg text-white" />
            </a>
          </div>
          <p className="text-white/80 mt-2 text-sm text-center md:text-right">
            Email: support@qmap.com<br />
            Phone: +123 456 7890
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20 mt-10 py-4 text-center text-white/70">
        © {new Date().getFullYear()} QMAP. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
