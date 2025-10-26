"use client";
import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Tokens as BaseTokens, MiniKit } from "@worldcoin/minikit-js";

// ===============================
// 🔧 CONFIGURACIÓN DE TOKENS
// ===============================
type Tokens = BaseTokens | "MD" | "WLD" | "USDC";
type TokenKey = "MD" | "WLD" | "USDC";

const TOKEN_CONFIG = {
  WLD: { symbol: "WLD", address: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003" },
  USDC: { symbol: "USDC", address: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1" },
  MD: { symbol: "MD", address: "0x6335c1F2967A85e98cCc89dA0c87e672715284dB" },
};

const DEFAULT_DECIMALS = 18;

const TOKEN_SYMBOL_MAP: Record<TokenKey, Tokens> = {
  MD: "MD",
  WLD: "WLD",
  USDC: "USDC",
};

// ===============================
// 💳 COMPONENTE PRINCIPAL
// ===============================
export default function PayComponent() {
  const [address, setAddress] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [token, setToken] = useState<TokenKey>("MD");
  const [scanning, setScanning] = useState(false);
  const [isMiniKitInstalled, setIsMiniKitInstalled] = useState(false);

  const readerRef = useRef<Html5Qrcode | null>(null);

  // Detectar si MiniKit está disponible
  useEffect(() => {
    setIsMiniKitInstalled(typeof window !== "undefined" && !!(window as any).MiniKit);
  }, []);

  // ===============================
  // 📸 ESCÁNER QR
  // ===============================
  const startScanner = async () => {
    if (scanning) return;

    try {
      const reader = new Html5Qrcode("reader");
      readerRef.current = reader;
      setScanning(true);

      await reader.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText: string) => {
          setAddress(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err) {
      console.error("Error al iniciar el escáner:", err);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (!readerRef.current) return;

    try {
      await readerRef.current.stop().catch(() => {});
      try {
        readerRef.current.clear();
      } catch {}
    } catch (err) {
      console.error("Error al detener el escáner:", err);
    }

    setScanning(false);
  };

  // ===============================
  // 💰 PROCESAR PAGO
  // ===============================
  const handlePayment = async () => {
    if (!isMiniKitInstalled) {
      alert("MiniKit no está instalado en este navegador.");
      return;
    }

    if (!address || !amount) {
      alert("Debes ingresar dirección y monto.");
      return;
    }

    const tokenInfo = TOKEN_CONFIG[token];
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Monto inválido.");
      return;
    }

    try {
      const minikit = new MiniKit();
      await minikit.pay({
        to: address,
        token: TOKEN_SYMBOL_MAP[token],
        amount: parsedAmount.toString(),
        decimals: DEFAULT_DECIMALS,
      });
      alert("Pago enviado correctamente ✅");
    } catch (error) {
      console.error(error);
      alert("Error al enviar el pago ❌");
    }
  };

  // ===============================
  // 🧱 UI
  // ===============================
  return (
    <div className="max-w-md mx-auto p-4 text-center bg-white rounded-2xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">Pagar con World ID + MiniKit</h2>

      {/* Dirección */}
      <input
        type="text"
        placeholder="Dirección del receptor"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full p-2 border rounded-md mb-2"
      />

      {/* Monto */}
      <input
        type="number"
        placeholder="Monto"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full p-2 border rounded-md mb-2"
      />

      {/* Token */}
      <select
        value={token}
        onChange={(e) => setToken(e.target.value as TokenKey)}
        className="w-full p-2 border rounded-md mb-4"
      >
        <option value="MD">MD</option>
        <option value="WLD">WLD</option>
        <option value="USDC">USDC</option>
      </select>

      {/* Botones */}
      <div className="flex justify-between gap-2 mb-4">
        <button
          onClick={startScanner}
          className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
        >
          {scanning ? "Escaneando..." : "Escanear QR"}
        </button>
        <button
          onClick={stopScanner}
          className="flex-1 bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
        >
          Detener
        </button>
      </div>

      <div id="reader" className="mx-auto w-full max-w-[300px] min-h-[300px]" />

      <button
        onClick={handlePayment}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
      >
        Enviar Pago
      </button>

      <p className="text-sm text-gray-500 mt-4">
        Tokens soportados: MD, WLD, USDC
      </p>
    </div>
  );
}
