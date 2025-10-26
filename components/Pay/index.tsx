"use client";

import React, { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { MiniKit } from "@worldcoin/minikit-js";

const TOKEN_SYMBOL_MAP: Record<string, string> = {
  ETH: "ETH",
  WLD: "WLD",
  USDC: "USDC",
};

export default function PayComponent() {
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("WLD");
  const [qrValue, setQrValue] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAddress, setScannedAddress] = useState("");
  const readerRef = useRef<Html5Qrcode | null>(null);

  const startScanner = async () => {
    if (isScanning) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      readerRef.current = html5QrCode;
      setIsScanning(true);

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          setQrValue(decodedText);
          setScannedAddress(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          console.warn("QR Scan Error:", errorMessage);
        }
      );
    } catch (err) {
      console.error("Error starting QR scanner:", err);
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
      console.error("Error stopping scanner:", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handlePayment = async () => {
    if (!scannedAddress || !amount) {
      alert("Por favor, escanea una dirección y coloca un monto válido.");
      return;
    }

    try {
      const minikit = new MiniKit();

      // Nueva forma de enviar tokens
      await minikit.actions.send({
        to: scannedAddress,
        token: TOKEN_SYMBOL_MAP[token],
        amount: amount.toString(),
      });

      alert(`✅ Pago de ${amount} ${token} enviado a ${scannedAddress}`);
      setAmount("");
      setScannedAddress("");
    } catch (error) {
      console.error("Error en el pago:", error);
      alert("❌ Error al procesar el pago.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-2xl p-6 text-center">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Pago con QR - World Chain</h2>

      <div id="qr-reader" className="w-full h-64 border rounded-lg mb-4"></div>

      {!isScanning ? (
        <button
          onClick={startScanner}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg w-full mb-3 transition"
        >
          Iniciar escaneo QR
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg w-full mb-3 transition"
        >
          Detener escaneo
        </button>
      )}

      {scannedAddress && (
        <div className="text-left mt-3 p-3 border rounded-lg bg-gray-50">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Dirección detectada:</strong> <br />
            <span className="break-all text-gray-900">{scannedAddress}</span>
          </p>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Monto"
            className="w-full border rounded-lg px-3 py-2 mb-3 text-gray-700 focus:ring focus:ring-blue-200"
          />

          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3 text-gray-700 focus:ring focus:ring-blue-200"
          >
            <option value="WLD">WLD</option>
            <option value="ETH">ETH</option>
            <option value="USDC">USDC</option>
          </select>

          <button
            onClick={handlePayment}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg w-full transition"
          >
            Enviar Pago
          </button>
        </div>
      )}
    </div>
  );
}

// 🔁 Alias opcional para compatibilidad con importaciones antiguas
export const PayBlockWithQR = PayComponent;
