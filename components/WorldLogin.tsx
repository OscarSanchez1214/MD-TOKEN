"use client";

import { MiniKit } from "@worldcoin/minikit-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorldLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !MiniKit.isInstalled()) {
      try {
        MiniKit.install();
      } catch (e) {
        console.error("Error al inicializar MiniKit:", e);
      }
    }
  }, []);

  async function signInWithWallet() {
    if (!MiniKit.isInstalled()) {
      alert("Por favor, abre esta Mini App dentro de World App.");
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
        statement: "Inicia sesión para acceder al sistema de Mundo Didáctico.",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      };

      // CORRECCIÓN DE TYPESCRIPT: Castear MiniKit como 'any' para evitar el error de tipado
      const result: any = await (MiniKit as any).walletAuth 
        ? await (MiniKit as any).walletAuth(input)
        : await (MiniKit as any).commandsAsync.walletAuth(input);

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
        setAuthStatus("Fallo la firma. Respuesta inesperada.");
      }
    } catch (error: any) {
      setAuthStatus(`Error técnico: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full flex flex-col items-center space-y-3">
      <button
        onClick={signInWithWallet}
        disabled={loading}
        className="w-full bg-[#111111] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-black/90 active:scale-95 transition-all shadow-md disabled:bg-gray-300"
      >
        {loading ? "Conectando..." : "Ingresar con World App 🚀"}
      </button>

      {authStatus && (
        <div className="text-xs font-medium text-blue-800 bg-blue-50 p-2.5 rounded-lg w-full break-all text-center">
          {authStatus}
        </div>
      )}
    </div>
  );
}
