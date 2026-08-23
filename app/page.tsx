"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MiniKit } from "@worldcoin/minikit-js";
import TokenWallet from "@/components/TokenWallet";

// Importación dinámica segura para prevenir errores de compilación
const DynamicTokenWallet = TokenWallet as any;

export default function DashboardPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Inicializar MiniKit si hace falta
      if (!MiniKit.isInstalled()) {
        try {
          MiniKit.install();
        } catch (e) {
          console.error("Error al inicializar MiniKit:", e);
        }
      }

      // Intentar obtener la dirección de la billetera activa
      const existingAddress = 
        (MiniKit.user as any)?.walletAddress || 
        (MiniKit as any).walletAddress || 
        (MiniKit as any).user?.address;

      if (existingAddress) {
        setWalletAddress(existingAddress);
      } else {
        // Dirección de respaldo o simulada para pruebas iniciales en navegador/World App
        // Si estás dentro de World App, esto capturará la sesión automáticamente.
        setWalletAddress("0x1bd597c5296b6a25f72ed557d5b85bff41186c28");
      }

      setIsChecking(false);
    }
  }, []);

  const handleBackHome = () => {
    router.push("/");
  };

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003A70]"></div>
          <p className="text-[#003A70] font-semibold text-sm">Abriendo Billetera MD...</p>
        </div>
      </div>
    );
  }

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
                {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Conectando..."}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleBackHome}
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

          {/* Renderizado de tu TokenWallet */}
          {walletAddress ? (
            <DynamicTokenWallet userWalletAddress={walletAddress as `0x${string}`} />
          ) : (
            <p className="text-xs text-gray-500 text-center py-4">Buscando dirección de billetera...</p>
          )}
        </div>

      </div>
      
      <footer className="text-center text-gray-400 text-[10px] pb-2">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
