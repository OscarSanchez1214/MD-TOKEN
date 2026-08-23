"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TokenWallet from "@/components/TokenWallet";

const DynamicTokenWallet = TokenWallet as any;

export default function DashboardPage() {
  const router = useRouter();
  const walletAddress = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-blue-50 to-white px-4 py-6 text-gray-800 relative"
      style={{
        backgroundImage: "url('/fondo-md.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full flex flex-col items-center flex-1 max-w-sm">
        
        {/* Cabecera del Dashboard */}
        <div className="w-full flex justify-between items-center bg-white/95 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm mb-6 border border-gray-100">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-md.png"
              alt="Mundo Didáctico"
              width={40}
              height={40}
              className="rounded-full shadow-sm"
            />
            <div>
              <h1 className="font-bold text-[#003A70] text-sm">Billetera MD</h1>
              <p className="text-[10px] text-gray-500 font-mono truncate w-24">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push("/")}
            className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Volver
          </button>
        </div>

        {/* Contenedor Principal de la Billetera MD */}
        <div className="w-full bg-white/95 rounded-3xl shadow-lg p-5 mb-6 backdrop-blur-sm space-y-4">
          <div className="pb-3 border-b border-gray-100 flex justify-between items-center">
            <span className="text-xs font-bold text-[#003A70]">Panel de Control Financiero</span>
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Activo</span>
          </div>

          <DynamicTokenWallet userWalletAddress={walletAddress as `0x${string}`} />
        </div>

      </div>
      
      <footer className="text-center text-gray-400 text-[10px] pb-2">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
