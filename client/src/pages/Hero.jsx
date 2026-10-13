import React from "react";
import { useNavigate } from "react-router-dom";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-screen overflow-hidden">

      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/videos/bkv.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Foreground Content */}
      <div className="relative z-20 flex flex-col justify-center items-center h-full px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
          Get Yourself <br /> To The Next Level
        </h1>
        <p className="mt-4 sm:mt-6 text-lg sm:text-xl text-white/80">
          Create Awareness for your Products, Earn Commission Affiliating, and BE GLOBAL WITH QMAP.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <button
            onClick={() => navigate("/login")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg transition transform hover:scale-105"
          >
            Start for free
          </button>
          <a
            href="/about"
            className="text-white underline hover:text-gray-300 mt-2 sm:mt-0"
          >
            › About QMAP
          </a>
        </div>
      </div>
    </section>
  );
}
