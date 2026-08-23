"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MiniKit } from "@worldcoin/minikit-js";
import PayComponent from "@/components/Pay";
import TokenWallet from "@/components/TokenWallet";
import recomendaciones from "@/data/recomendaciones.json";

// Dirección oficial de recepción de donaciones
const RECEIVER_ADDRESS = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const hoy = new Date().toISOString().split("T")[0];
  const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy);

  // Inicializar MiniKit y comprobar sesión previa al cargar la página
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!MiniKit.isInstalled()) {
        try {
          MiniKit.install();
        } catch (e) {
          console.error("Error al inicializar MiniKit:", e);
        }
      }

      // Comprobar si ya hay una sesión guardada
      const existingAddress = (MiniKit.user as any)?.walletAddress;
      if (existingAddress) {
        setWalletAddress(existingAddress);
      }
    }
  }, []);

  // Función segura de inicio de sesión compatible con múltiples versiones de MiniKit
  const handleSignIn = async () => {
    if (!MiniKit.isInstalled()) {
      alert("Debes abrir esta app dentro de World App.");
      return;
    }

    setIsAuthenticating(true);

    try {
      // 1. Obtenemos el nonce de tu backend
      const res = await fetch("/api/nonce");
      if (!res.ok) throw new Error("Fallo al obtener el nonce");
      const { nonce } = await res.json();

      const authOptions = {
        nonce,
        statement: "Inicia sesión para acceder a tu billetera de Mundo Didáctico.",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      };

      let result: any = null;

      // 2. Invocación segura para prevenir errores de función no encontrada
      if (typeof (MiniKit as any).walletAuth === "function") {
        result = await (MiniKit as any).walletAuth(authOptions);
      } else if (MiniKit.commands && typeof (MiniKit.commands as any).walletAuth === "function") {
        result = await (MiniKit.commands as any).walletAuth(authOptions);
      } else {
        throw new Error("El método walletAuth no está disponible en esta versión del SDK.");
      }

      // 3. Validar respuesta exitosa
      if (result?.executedWith === "minikit" || result?.status === "success" || result?.data) {
        const address = result?.data?.address || (MiniKit.user as any)?.walletAddress;
        if (address) {
          setWalletAddress(address);
        } else {
          alert("No se pudo recuperar la dirección de la billetera.");
        }
      } else {
        console.warn("Autenticación cancelada o rechazada por el usuario.");
      }
    } catch (error: any) {
      console.error("Error técnico al iniciar sesión:", error);
      alert(`Error técnico: ${error.message || "No se pudo completar el acceso"}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-blue-50 to-white px-4 py-8 text-gray-800 relative"
      style={{
        backgroundImage: "url('/fondo-md.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Logo y encabezado */}
      <div className="mt-6 mb-8 text-center">
        <a
          href="https://edicionesmd.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/logo-md.png"
            alt="Mundo Didáctico Logo"
            width={100}
            height={100}
            className="mx-auto rounded-full shadow-md hover:scale-105 transition-transform"
            priority
          />
        </a>
        <h1 className="mt-4 text-2xl font-bold text-[#003A70]">
          MUNDO DIDÁCTICO
        </h1>
        <p className="text-gray-600 text-sm mt-1">
          Educación Emocional y Financiera
        </p>
      </div>

      {/* Tarjeta principal */}
      <div className="w-full max-w-md bg-white/90 rounded-2xl shadow-lg p-6 mb-8 text-center backdrop-blur-sm space-y-6">
        
        {/* Renderizado condicional: Si ya inició sesión muestra TokenWallet, sino muestra el login y las recomendaciones */}
        {walletAddress ? (
          <div className="w-full">
            <TokenWallet userWalletAddress={walletAddress as `0x${string}`} />
          </div>
        ) : (
          <>
            {/* Bloque de recomendación */}
            <div>
              <h2 className="text-xl font-semibold text-[#003A70] mb-2">
                Recomendación del Día 💡
              </h2>

              {recomendacionDelDia ? (
                <article className="bg-gray-50 p-4 rounded-xl shadow-sm text-left">
                  <h3 className="font-semibold text-[#003A70] mb-1">
                    {recomendacionDelDia.titulo}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">
                    {recomendacionDelDia.contenido}
                  </p>

                  {recomendacionDelDia.video ? (
                    <div className="overflow-hidden rounded-xl shadow-sm">
                      <iframe
                        className="w-full aspect-video rounded-xl"
                        src={recomendacionDelDia.video}
                        title={recomendacionDelDia.titulo}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 mt-2 text-center">
                      🎬 Próximamente video relacionado
                    </p>
                  )}
                </article>
              ) : (
                <p className="text-gray-500 text-sm">
                  No hay recomendación disponible para hoy.
                </p>
              )}
            </div>

            {/* Bloque de donación / pagos */}
            <div className="border-t border-gray-200 pt-4 space-y-4 text-left">
              <h4 className="text-xs font-semibold text-[#003A70] leading-relaxed">
                Cada día puedes recibir una recomendación financiera acompañada de un video para aprender a manejar mejor tu dinero, fortalecer tus hábitos de inversión e impulsar tu inteligencia financiera. 💡💰📈
              </h4>
              
              <p className="text-xs text-gray-600">
                Agradecemos tu apoyo. Puedes donar en{" "}
                <strong>MD</strong>, <strong>WLD</strong> o <strong>USDC</strong>.
              </p>

              <PayComponent />

              <div className="text-[11px] text-gray-500 break-all">
                Dirección oficial:{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">
                  {RECEIVER_ADDRESS}
                </code>
              </div>
            </div>

            {/* Botón de Autenticación con World App */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={handleSignIn}
                disabled={isAuthenticating}
                className="w-full bg-[#111111] text-white py-3.5 rounded-xl font-semibold text-sm active:scale-[0.98] transition-all shadow-md disabled:opacity-70"
              >
                {isAuthenticating ? "Conectando..." : "Ingresar con World App 🚀"}
              </button>
            </div>
          </>
        )}

      </div>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-xs mt-auto pb-4">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
