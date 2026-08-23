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
    setAuthStatus("1. Solicitando nonce al servidor...");

    try {
      const response = await fetch("/api/nonce");
      if (!response.ok) {
        throw new Error(`Fallo al obtener nonce (Status: ${response.status})`);
      }
      const { nonce } = await response.json();

      setAuthStatus("2. Abriendo ventana de firma en World App...");

      const input = {
        nonce,
        statement: "Firma para confirmar la propiedad de la billetera y autenticarte en MUNDO DIDACTICO.",
        // Se envía como Date puro, el SDK se encarga de procesarlo internamente
        expirationTime: new Date(Date.now() + 1000 * 60 * 60), 
      };

      // Invocación protegida para pasar el chequeo de Vercel y ejecutar el comando correctamente
      const result: any = await (MiniKit.commands as any).walletAuth(input);

      if (!result || result.executedWith === "fallback") {
        setAuthStatus("Autenticación cancelada o no soportada por el dispositivo.");
        setLoading(false);
        return;
      }

      const payload = result.finalPayload || result.data;

      if (payload && (payload.status === "success" || payload.signature)) {
        setAuthStatus("3. Verificando firma en el servidor...");

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
          setAuthStatus(`Error del servidor: ${verifyData.error || "Firma inválida"}`);
        }
      } else {
        setAuthStatus("El usuario rechazó la firma o la operación no se completó.");
      }
    } catch (error: any) {
      console.error("Error detallado en autenticación:", error);
      setAuthStatus(`Error técnico: ${error.message || JSON.stringify(error)}`);
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
            {loading ? "Procesando..." : "Iniciar Sesión (Sign-In) 🚀"}
          </button>
          
          {authStatus && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl mt-2 text-left break-all shadow-sm">
              <span className="font-bold block mb-1">Estado del proceso:</span>
              {authStatus}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs py-2 px-3 rounded-lg text-center font-medium shadow-sm">
            ✓ Sesión iniciada: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
          <TokenWallet />
        </div>
      )}
    </div>
  );
}
