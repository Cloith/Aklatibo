import { ArrowRight } from "lucide-react";
// Import the open-source Magic UI iPhone Mockup component if installed
// or replace it with standard image components pointing to your dashboard frames
import { iPhone15ProMockup } from "@/components/magicui/iphone-mockup"; 

export default function HeroSection() {
  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col justify-between overflow-hidden">
      
      {/* 1. Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <span className="p-1.5 border-2 border-black rounded-lg">📖</span>
          Aklatibo
        </div>
        <button className="bg-[#EF4444] text-white font-medium px-5 py-2 rounded-full hover:bg-red-600 transition-colors shadow-sm text-sm">
          Get Started
        </button>
      </header>

      {/* 2. Main Content Hero Body */}
      <main className="flex-1 flex flex-col items-center text-center px-4 pt-16 md:pt-24 z-10">
        
        {/* Centered App Brand Icon */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-3xl text-white font-bold">A</span>
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">Aklatibo AI</span>
        </div>

        {/* Major Headline Typography */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-4">
          Smart digital reading <br /> powered by AI.
        </h1>
        
        {/* Supporting Copy Description */}
        <p className="text-gray-600 md:text-lg max-w-xl leading-relaxed mb-8">
          Aklatibo transforms your massive PDF textbook libraries into structured, interactive digital learning insights instantly.
        </p>

        {/* Action Call-to-Action (CTA) */}
        <button className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all shadow-md">
          Access the Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </main>

      {/* 3. The Peek-a-Boo Device Mockup Row */}
      <div className="relative w-full overflow-hidden mt-12 pt-10">
        <div className="flex justify-center items-end gap-4 md:gap-6 max-w-7xl mx-auto px-4 translation-y-16 md:translate-y-24">
          
          {/* Left Wing Mockup (Slightly smaller or offset) */}
          <div className="hidden md:block w-64 opacity-75 transform translate-y-12 transition-transform duration-500 hover:translate-y-4">
            <iPhone15ProMockup src="/images/dashboard-mobile-view.png" />
          </div>

          {/* Center Primary Mockup (The Hero Feature Image) */}
          <div className="w-72 md:w-80 transform transition-transform duration-500 hover:-translate-y-2 shadow-2xl rounded-[40px]">
            <iPhone15ProMockup src="/images/dashboard-main.png" />
          </div>

          {/* Right Wing Mockup */}
          <div className="hidden md:block w-64 opacity-75 transform translate-y-12 transition-transform duration-500 hover:translate-y-4">
            <iPhone15ProMockup src="/images/pdf-viewer-view.png" />
          </div>
          
        </div>
      </div>

    </div>
  );
}