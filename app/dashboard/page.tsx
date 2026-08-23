"use client";

import React, { useState, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import TokenWallet from "@/components/TokenWallet";

const DynamicTokenWallet = TokenWallet as any;

export default function DashboardPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!MiniKit.isInstalled()) {
        try {
          MiniKit.install();
        } catch (e) {
          console.error("Error al inicializar MiniKit:", e);
        }
      }

      const existingAddress = (MiniKit.user as any)?.walletAddress || (MiniKit as any).walletAddress;
      if (existingAddress) {
        setWalletAddress(existingAddress);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black">Plataforma Educativa MD</h1>
          {walletAddress && (
            <span className="text-xs bg-gray-200 px-3 py-1.5 rounded-lg font-mono">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </span>
          )}
        </header>

        {walletAddress ? (
          <DynamicTokenWallet userWalletAddress={walletAddress as `0x${string}`} />
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center space-y-4">
            <p className="text-sm text-gray-600">Por favor, inicia sesión desde la página principal para vincular tu billetera.</p>
            <a href="/" className="inline-block bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold">
              Ir al inicio
            </a>
          </div>
        )}

        <section className="mt-12 bg-white p-6 rounded-3xl border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-black">Tus Módulos</h2>
          <p className="text-gray-600">Bienvenido al área de aprendizaje. Pronto aparecerán tus recursos aquí.</p>
        </section>

      </div>
    </main>
  );
}
