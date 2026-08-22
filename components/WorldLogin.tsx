"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import TokenWallet from "@/components/TokenWallet";

export default function WorldLogin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  async function signInWithWallet() {
    if (!MiniKit.isInstalled()) {
      alert("Por favor, abre esta Mini App directamente desde World App.");
      return;
    }

    setLoading(true);
    setAuthStatus("Solicitando sesión...");

    try {
      // 1. Solicitamos el nonce al backend
      const response = await fetch("/api/nonce");
      const { nonce } = await response.json();

      const input = {
        nonce,
        statement: "Firma para confirmar la propiedad de la billetera y autenticarte en MUNDO DIDACTICO.",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      };

      // 2. Ejecutamos walletAuth usando casting de tipos para evitar el error de compilación
      const result: any = await (MiniKit as any).walletAuth(input);

      if (!result || result.executedWith === "fallback") {
        setAuthStatus("Autenticación cancelada o no soportada.");
        setLoading(false);
        return;
      }

      // Soportamos ambas estructuras de respuesta del SDK
      const payload = result.finalPayload || result.data;

      if (payload && (payload.status === "success" || payload.signature)) {
        // 3. Verificamos la firma en el backend
        const verifyResponse = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload,
            nonce,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.isValid && verifyData.address) {
          setWalletAddress(verifyData.address);
          setAuthStatus("¡Autenticación exitosa!");
        } else {
          setAuthStatus("Error de verificación en el servidor.");
        }
      } else {
        setAuthStatus("El usuario rechazó la firma.");
      }
    } catch (error) {
      console.error(error);
      setAuthStatus("Error al procesar la autenticación.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full">
      {!walletAddress ? (
        <div className="text-center w-full space-y-3">
          <p className="text-xs text-gray-600">
            Inicia sesión para firmar con tu billetera de World Chain.
          </p>
          <button
            onClick={signInWithWallet}
            disabled={loading}
            className="w-full py-3 bg-[#013A72] text-white text-sm font-bold rounded-xl hover:bg-[#0154A0] disabled:bg-gray-300 transition-colors shadow-md"
          >
            {loading ? "Procesando en World App..." : "Iniciar Sesión (Sign-In) 🚀"}
          </button>
          {authStatus && (
            <p className="text-xs text-blue-600 font-medium">{authStatus}</p>
          )}
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-lg text-center font-medium">
            ✓ Sesión iniciada: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
          {/* Mostramos el módulo completo de la billetera MD una vez autenticado */}
          <TokenWallet />
        </div>
      )}
    </div>
  );
}
