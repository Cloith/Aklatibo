import { Download } from "lucide-react"; // 1. Swapped ArrowRight for Download
import Image from "next/image";
import appIcon from "../assets/icon.png"; 

export default function HeroSection() {
  return (
    <div className="relative min-h-screen bg-white text-black flex flex-col justify-between overflow-hidden">
      
      {/* 1. Header Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          {/* Logo Wrapper */}
          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-gray-200">
            <Image 
              src={appIcon} 
              alt="Aklatibo Logo" 
              fill
              className="object-cover"
            />
          </div>
          Aklatibo
        </div>
        {/* <button className="bg-[#EF4444] text-white font-medium px-5 py-2 rounded-full hover:bg-red-600 transition-colors shadow-sm text-sm">
          Download App
        </button> */}
      </header>

      {/* 2. Main Content Hero Body */}
      <main className="flex-1 flex flex-col items-center text-center px-4 pt-16 md:pt-24 z-10">
        
        {/* Centered Phone App Icon Slot */}
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="relative w-16 h-16 bg-[#EF4444] rounded-2xl flex items-center justify-center shadow-md overflow-hidden">
            <Image 
              src={appIcon} 
              alt="Aklatibo App Icon" 
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">Your Personal Library</span>
        </div>

        {/* Major Headline Typography */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.1] mb-4">
          Your entire textbook library, <br /> all in one place.
        </h1>
        
        {/* Supporting Copy Description */}
        <p className="text-gray-600 md:text-lg max-w-xl leading-relaxed mb-8">
          Aklatibo brings your massive digital book collections together. Catalog, browse, and read your PDF textbook libraries seamlessly across your devices.
        </p>

        {/* Action Call-to-Action (CTA) - Simplified to Download */}
        <a 
          href="/aklatibo.apk" 
          download="aklatibo.apk"
          className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-all shadow-md cursor-pointer"
        >
          Download the App <Download className="w-4 h-4" />
        </a>
        <p className="text-xs text-gray-400 max-w-xs leading-normal">
          Android MVP build. You may need to allow "Install from Unknown Sources" in your browser settings.
        </p>
      </main>

    </div>
  );
}