"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MiniKit } from "@worldcoin/minikit-js";
import PayComponent from "@/components/Pay";
import recomendaciones from "@/data/recomendaciones.json";

const RECEIVER_ADDRESS = "0x1bd597c5296b6a25f72ed557d5b85bff41186c28";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const router = useRouter();

  const hoy = new Date().toISOString().split("T")[0];
  const recomendacionDelDia = recomendaciones.find((r) => r.fecha === hoy);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Nota: Ya NO usamos MiniKit.install() aquí porque minikit-provider.tsx se encarga de eso.

      // Verificamos si ya hay una billetera guardada en la sesión del usuario
      const existingAddress = (MiniKit.user as any)?.walletAddress || (MiniKit as any).walletAddress;
      if (existingAddress) {
        setWalletAddress(existingAddress);
      }
    }
  }, []);

  const handleSignIn = async () => {
    setErrorMsg("");

    if (!MiniKit.isInstalled()) {
      setErrorMsg("⚠️ Abre esta mini app estrictamente dentro de World App.");
      return;
    }

    setIsAuthenticating(true);

    try {
      // 1. Generar el nonce (como exige la documentación: alfanumérico y > 8 caracteres)
      const nonce = crypto.randomUUID().replace(/-/g, "");

      const input = {
        nonce,
        statement: "Inicia sesión para acceder a tu billetera de Mundo Didáctico.",
        expirationTime: new Date(Date.now() + 1000 * 60 * 60),
      };

      // 2. Llamada unificada recomendada por la documentación oficial
      const result = await MiniKit.walletAuth(input);

      // 3. Manejar el resultado según la documentación
      if (result.executedWith === "fallback") {
        setErrorMsg("Autenticación fallida o cancelada.");
        setIsAuthenticating(false);
        return;
      }

      // 4. Si es exitoso, extraemos la dirección y enviamos al dashboard
      if (result.data && result.data.address) {
        setWalletAddress(result.data.address);
        router.push("/dashboard");
      } else {
        setErrorMsg("No se recibió la dirección de la billetera.");
      }
    } catch (error: any) {
      console.error("Error técnico al iniciar sesión:", error);
      setErrorMsg(`Error: ${error.message || "No se pudo completar el acceso"}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-between bg-gradient-to-b from-blue-50 to-white px-4 py-6 text-gray-800 relative"
      style={{
        backgroundImage: "url('/fondo-md.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full flex flex-col items-center flex-1">
        
        {/* Encabezado */}
        <div className="mt-4 mb-6 text-center">
          <a href="https://edicionesmd.com" target="_blank" rel="noopener noreferrer">
            <Image
              src="/logo-md.png"
              alt="Mundo Didáctico Logo"
              width={90}
              height={90}
              className="mx-auto rounded-full shadow-md hover:scale-105 transition-transform"
              priority
            />
          </a>
          <h1 className="mt-3 text-2xl font-bold text-[#003A70]">MUNDO DIDÁCTICO</h1>
          <p className="text-gray-600 text-xs mt-0.5">Educación Emocional y Financiera</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="w-full max-w-sm bg-white/95 rounded-3xl shadow-lg p-5 mb-6 text-center backdrop-blur-sm space-y-5">
          {walletAddress ? (
            
            <div className="space-y-4 py-4">
              <h2 className="text-lg font-bold text-[#003A70]">¡Bienvenido de nuevo!</h2>
              <p className="text-sm text-gray-600">Tu billetera está conectada.</p>
              
              <button 
                onClick={() => router.push("/dashboard")}
                className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-sm"
              >
                IR A BILLETERA MD DASHBOARD
              </button>

              <button 
                onClick={() => setWalletAddress(null)}
                className="text-xs text-red-500 hover:underline mt-2 block w-full"
              >
                Cerrar sesión
              </button>
            </div>

          ) : (
            <div className="space-y-5">
              
              {/* Recomendación del Día */}
              <div>
                <h2 className="text-lg font-bold text-[#003A70] mb-2">Recomendación del Día 💡</h2>
                {recomendacionDelDia ? (
                  <article className="bg-gray-50 p-3.5 rounded-2xl shadow-sm text-left border border-gray-100">
                    <h3 className="font-semibold text-sm text-[#003A70] mb-1">{recomendacionDelDia.titulo}</h3>
                    <p className="text-xs text-gray-700 leading-relaxed mb-3">{recomendacionDelDia.contenido}</p>
                    {recomendacionDelDia.video && (
                      <div className="overflow-hidden rounded-xl shadow-sm">
                        <iframe
                          className="w-full aspect-video rounded-xl"
                          src={recomendacionDelDia.video}
                          title={recomendacionDelDia.titulo}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </article>
                ) : (
                  <p className="text-gray-500 text-xs">No hay recomendación disponible para hoy.</p>
                )}
              </div>

              {/* Pagos / Donaciones */}
              <div className="border-t border-gray-100 pt-4 space-y-3 text-left">
                <h4 className="text-[11px] font-medium text-gray-600 leading-relaxed">
                  Aprende a manejar mejor tu dinero, fortalecer tus hábitos e impulsar tu inteligencia financiera. 💡💰📈
                </h4>
                <PayComponent />
                <div className="text-[10px] text-gray-400 break-all">
                  Dirección oficial: <code className="bg-gray-50 px-1.5 py-0.5 rounded text-gray-600 font-mono">{RECEIVER_ADDRESS}</code>
                </div>
              </div>

              {/* Botón de Acceso */}
              <div className="pt-2">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthenticating}
                  className="w-full bg-black text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all disabled:opacity-50 shadow-sm flex justify-center items-center gap-2"
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Conectando...</span>
                    </>
                  ) : (
                    'IR A BILLETERA MD DASHBOARD'
                  )}
                </button>

                {errorMsg && (
                  <p className="text-red-500 mt-3 text-xs font-medium bg-red-50 p-2 rounded-lg">{errorMsg}</p>
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      <footer className="text-center text-gray-400 text-[10px] pb-2">
        Ediciones Mundo Didáctico 2026
      </footer>
    </main>
  );
}
