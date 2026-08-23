"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MiniKit } from "@worldcoin/minikit-js";
import TokenWallet from "@/components/TokenWallet";

// Importación dinámica segura para evitar problemas de tipos estrictos
const DynamicTokenWallet = TokenWallet as any;

export default function Dashboard() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // 1. Verificamos que MiniKit esté instalado
      if (!MiniKit.isInstalled()) {
        try {
          MiniKit.install();
        } catch (e) {
          console.error("Error al inicializar MiniKit:", e);
        }
      }

      // 2. Buscamos la billetera activa en la sesión
      const existingAddress = (MiniKit.user as any)?.walletAddress || (MiniKit as any).walletAddress;
      
      if (existingAddress) {
        setWalletAddress(existingAddress);
      } else {
        // Si no hay sesión, regresamos al usuario al inicio (Home)
        router.push("/");
      }
      setIsChecking(false);
    }
  }, [router]);

  const handleLogout = () => {
    // Al cerrar sesión, limpiamos el estado visual y volvems al inicio
    setWalletAddress(null);
    router.push("/");
  };

  // Pantalla de carga mientras verifica la sesión
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003A70]"></div>
          <p className="text-[#003A70] font-semibold text-sm">Cargando tu billetera...</p>
        </div>
      </div>
    );
  }

  // Si terminó de checar y no hay wallet, retorna null (el router.push hará su trabajo)
  if (!walletAddress) {
    return null;
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-50 to-white px-4 py-6 text-gray-800 relative"
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
              <h1 className="font-bold text-[#003A70] text-sm">Dashboard MD</h1>
              <p className="text-[10px] text-gray-500 font-mono truncate w-24">
                {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium"
          >
            Salir
          </button>
        </div>

        {/* Contenedor Principal de la Billetera */}
        <div className="w-full bg-white/95 rounded-3xl shadow-lg p-5 mb-6 backdrop-blur-sm">
          <div className="pb-3 mb-3 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-700">Mi Billetera (World Chain)</span>
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
