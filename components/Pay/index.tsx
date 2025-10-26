"use client";

import React, { useState } from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import { MiniKit } from "@worldcoin/minikit-js";
import { ethers } from "ethers";

// ✅ Mapa de tokens con tus contratos reales
const TOKEN_SYMBOL_MAP: Record<string, string> = {
  MD: "0x6335c1F2967A85e98cCc89dA0c87e672715284dB",
  WLD: "0x2cFc85d8E48F8EAB294be644d9E25C3030863003",
  USDC: "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1",
};

export default function Pay() {
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<string>("MD");
  const [qrValue, setQrValue] = useState<string>("");
  const [scannedAddress, setScannedAddress] = useState<string>("");
  const [status, setStatus] = useState<string>("Esperando pago...");

  const handleGenerateQR = () => {
    if (!amount || amount <= 0) {
      alert("Por favor ingresa un monto válido.");
      return;
    }

    const qrData = JSON.stringify({
      to: scannedAddress || "0x0000000000000000000000000000000000000000",
      token,
      amount,
    });

    setQrValue(qrData);
    setStatus("QR generado, listo para escanear con World App.");
  };

  const handlePayment = async () => {
    try {
      if (!scannedAddress) {
        alert("Por favor ingresa una dirección válida antes de pagar.");
        return;
      }

      const minikit = new MiniKit();

      // ✅ En la versión 1.3.0 se usa directamente .pay()
      await minikit.pay({
        to: scannedAddress,
        token: TOKEN_SYMBOL_MAP[token],
        amount: amount.toString(),
        description: `Pago en ${token} desde Mundo Didáctico`,
      });

      setStatus("✅ Pago enviado con éxito");
    } catch (error: any) {
      console.error("Error al realizar el pago:", error);
      setStatus("❌ Error al realizar el pago");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <motion.div
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          💠 Mundo Didáctico - Pagos con World ID
        </h1>

        <div className="space-y-4">
          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-3"
          />

          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            <option value="MD">MD</option>
            <option value="WLD">WLD</option>
            <option value="USDC">USDC</option>
          </select>

          <input
            type="text"
            placeholder="Dirección del destinatario"
            value={scannedAddress}
            onChange={(e) => setScannedAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-3"
          />

          <button
            onClick={handleGenerateQR}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Generar QR
          </button>

          {qrValue && (
            <div className="flex flex-col items-center mt-6">
              <QRCode value={qrValue} size={180} />
              <p className="mt-2 text-gray-500 text-sm">Escanea con World App</p>
            </div>
          )}

          <button
            onClick={handlePayment}
            className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
          >
            Enviar Pago
          </button>

          <p className="text-center text-gray-700 mt-4 font-medium">{status}</p>
        </div>
      </motion.div>
    </div>
  );
}
