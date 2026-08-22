"use client";

import { MiniKit, ResponseEvent } from "@worldcoin/minikit-js";
import { useEffect, useState } from "react";
import TokenWallet from "@/components/TokenWallet";

export default function WorldLogin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      console.log("La Mini App no está ejecutándose dentro de World App");
      return;
    }

    // Comprobar si ya existe una sesión activa previa en MiniKit
    if (MiniKit.walletAddress) {
      setWalletAddress(MiniKit.walletAddress);
    }

    const handleResponse = (response: any) => {
      console.log("Respuesta de World Wallet Auth:", response);

      if (response.detail && response.detail.status === "success") {
        const address = MiniKit.walletAddress;
        if (address) {
          setWalletAddress(address);
        }
      }
    };

    MiniKit.subscribe(ResponseEvent.MiniAppWalletAuth, handleResponse);

    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppWalletAuth);
    };
  }, []);

  async function iniciarSesionWorld() {
    if (!MiniKit.isInstalled()) {
      alert("Por favor, abre esta Mini App directamente desde World App.");
      return;
    }

    setLoading(true);

    try {
      const res = await MiniKit.commandsAsync.walletAuth({
        nonce: crypto.randomUUID(),
        requestId: "mundo-didactico-login",
        statement: "Inicia sesión en Mundo Didáctico para gestionar tus tokens MD y educación financiera.",
      });

      console.log("Resultado Wallet Auth:", res);

      if (res?.finalPayload?.status === "success") {
        const address = MiniKit.walletAddress;
        if (address) {
          setWalletAddress(address);
        }
      }
    } catch (error) {
      console.error("Error en autenticación World:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      {!walletAddress ? (
        <div className="text-center w-full space-y-3">
          <p className="text-xs text-gray-600">
            Conecta tu cuenta para ver tu saldo y operar en World Chain.
          </p>
          <button
            onClick={iniciarSesionWorld}
            disabled={loading}
            className="w-full py-3 bg-[#013A72] text-white text-sm font-bold rounded-xl hover:bg-[#0154A0] disabled:bg-gray-300 transition-colors shadow-md"
          >
            {loading ? "Conectando con World App..." : "Abrir mi billetera 🚀"}
          </button>
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-lg text-center font-medium">
            ✓ Billetera conectada a World App
          </div>
          {/* Mostramos la billetera y funciones de Token MD */}
          <TokenWallet />
        </div>
      )}
    </div>
  );
}
