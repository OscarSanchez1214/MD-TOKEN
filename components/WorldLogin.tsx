"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import { useRouter } from "next/navigation"; // Importamos el enrutador de Next.js

export default function WorldLogin() {
  const router = useRouter(); // Inicializamos el enrutador
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  async function signInWithWallet() {
    if (!MiniKit.isInstalled()) {
      alert("Por favor, abre esta Mini App directamente desde World App.");
      return;
    }

    setLoading(true);
    setAuthStatus("Solicitando acceso...");

    try {
      const response = await fetch("/api/nonce");
      if (!response.ok) throw new Error("Fallo al obtener nonce");
      const { nonce } = await response.json();

      setAuthStatus("Abriendo ventana de firma...");

      const input = {
        nonce,
        statement: "Firma para confirmar la propiedad de la billetera y autenticarte en MUNDO DIDACTICO.",
      };

      const result: any = await (MiniKit.commands as any).walletAuth(input);

      if (!result || result.executedWith === "fallback") {
        setAuthStatus("Autenticación cancelada.");
        setLoading(false);
        return;
      }

      const payload = result.finalPayload || result.data;

      if (payload && (payload.status === "success" || payload.signature)) {
        setAuthStatus("Verificando firma...");

        const verifyResponse = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload, nonce }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.isValid && verifyData.address) {
          setAuthStatus("¡Autenticación exitosa! Entrando...");
          
          // ¡MAGIA AQUÍ! Redirigimos a la página del dashboard tras 1 segundo
          setTimeout(() => {
            router.push("/dashboard"); 
          }, 1000);

        } else {
          setAuthStatus("Firma inválida");
        }
      } else {
        setAuthStatus("El usuario rechazó la firma.");
      }
    } catch (error: any) {
      setAuthStatus("Error técnico al conectar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full max-w-sm mx-auto p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
      <div className="text-center w-full space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Bienvenido a MD</h2>
        <p className="text-sm text-gray-500">
          Inicia sesión de forma segura usando tu billetera de World App.
        </p>
        
        <button
          onClick={signInWithWallet}
          disabled={loading}
          className="w-full py-4 bg-black text-white text-md font-bold rounded-2xl hover:bg-gray-800 disabled:bg-gray-300 transition-all shadow-md"
        >
          {loading ? "Procesando..." : "Ingresar con World App 🚀"}
        </button>
        
        {authStatus && (
          <div className="text-xs font-medium text-blue-600 mt-2 bg-blue-50 p-2 rounded-lg">
            {authStatus}
          </div>
        )}
      </div>
    </div>
  );
}
