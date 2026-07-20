import Image from "next/image"
import { LoginForm } from "@/components/LoginForm"
import logoIcon from "@/assets/icon.png"

export default function LoginPage() {
  return (
    <div 
      className="relative flex min-h-screen w-screen flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-6 md:p-10 select-none"
      style={{ backgroundImage: "url('/images/edu-bg.jpg')" }}
    >
      {/* Subtle light overlay to smooth out vector line contrasts */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px] z-0" />

      {/* Content Container */}
      <div className="relative z-10 flex w-full max-w-sm flex-col gap-5">
        
        {/* Header App Brand Area - High contrast dark gray text over light glass */}
        <div className="flex items-center gap-3 self-center bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/50 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
            <Image 
              src={logoIcon} 
              alt="Aklatibo Logo" 
              width={36} 
              height={36} 
              className="object-cover"
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800">
            Aklatibo
          </span>
        </div>

        {/* Pure Light Glassmorphism Card Wrapper */}
        <div className="w-full rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-xl shadow-slate-300/40 overflow-hidden">
          <LoginForm />
        </div>

      </div>
    </div>
  )
}