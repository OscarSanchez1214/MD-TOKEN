"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorldLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  async function signInWithWallet() {
    if (!MiniKit.isInstalled()) {
      alert("Por favor, abre esta Mini App en World App.");
      return;
    }

    setLoading(true);
    setAuthStatus("1. Solicitando acceso...");

    try {
      const response = await fetch("/api/nonce");
      if (!response.ok) throw new Error("Fallo al obtener nonce");
      const { nonce } = await response.json();

      setAuthStatus("2. Abriendo ventana de firma...");

      const input = {
        nonce,
        statement: "Firma para confirmar la propiedad de la billetera y autenticarte en MUNDO DIDACTICO.",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      };

      // CORRECCIÓN: walletAuth está en la raíz de MiniKit, no en .commands
      const result: any = await (MiniKit as any).walletAuth(input);

      if (!result || result.executedWith === "fallback") {
        setAuthStatus("Error: Ejecutado fuera de World App.");
        setLoading(false);
        return;
      }

      if (result.data?.status === "error") {
        setAuthStatus("El usuario rechazó la firma.");
        setLoading(false);
        return;
      }

      if (result.data && result.data.signature) {
        setAuthStatus("3. Verificando firma en el servidor...");

        const verifyResponse = await fetch("/api/complete-siwe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            payload: result.data,
            nonce,
          }),
        });

        const verifyData = await verifyResponse.json();

        if (verifyData.isValid) {
          setAuthStatus("¡Autenticación exitosa! Redirigiendo...");
          
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        } else {
          setAuthStatus(`Firma inválida: ${verifyData.error || "Error desconocido"}`);
        }
      } else {
        setAuthStatus("Fallo la firma. Respuesta: " + JSON.stringify(result.data));
      }
    } catch (error: any) {
      setAuthStatus(`Error técnico: ${error.message}`);
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
          <div className="text-xs font-medium text-blue-800 mt-2 bg-blue-50 p-3 rounded-lg break-all">
            {authStatus}
          </div>
        )}
      </div>
    </div>
  );
}
