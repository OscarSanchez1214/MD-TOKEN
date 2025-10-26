"use client";

import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";

const TOKEN_SYMBOL_MAP: Record<string, string> = {
  USDC: "USDC",
  WLD: "WLD",
  ETH: "ETH",
  MD: "MD",
};

export default function PayComponent() {
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<string>("USDC");
  const [address, setAddress] = useState<string>("");
  const [scannedAddress, setScannedAddress] = useState<string>("");
  const [qrData, setQrData] = useState<string>("");
  const [status, setStatus] = useState<string>("Esperando datos...");
  const [loading, setLoading] = useState<boolean>(false);

  const handleGenerateQR = () => {
    if (!address || !amount) {
      alert("Por favor ingresa la dirección y el monto.");
      return;
    }

    const qrInfo = JSON.stringify({ address, amount, token });
    setQrData(qrInfo);
    setStatus("QR generado, listo para escanear.");
  };

  const handleScanQR = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.address) {
        setScannedAddress(parsed.address);
        setAmount(parsed.amount);
        setToken(parsed.token);
        setStatus("Datos escaneados correctamente ✅");
      }
    } catch {
      alert("Error al leer el código QR.");
    }
  };

  const handlePayment = async () => {
    if (!scannedAddress || !amount) {
      alert("Escanea un QR válido o ingresa los datos del pago.");
      return;
    }

    setLoading(true);
    setStatus("Procesando pago...");

    try {
      const minikit = new MiniKit();

      // ✅ Compatible con la versión 1.3.0 (usa pay)
      await minikit.pay({
        to: scannedAddress,
        token: TOKEN_SYMBOL_MAP[token],
        amount: amount.toString(),
      });

      setStatus(`✅ Pago de ${amount} ${token} enviado a ${scannedAddress}`);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Error al procesar el pago. Ver consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <motion.div
        className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-800">
          💸 Enviar o Recibir Tokens
        </h2>

        {/* FORMULARIO PARA GENERAR QR */}
        <div className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Dirección destino"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <input
            type="number"
            placeholder="Monto"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            className="w-full border rounded-lg p-2 text-sm"
          />
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm"
          >
            {Object.keys(TOKEN_SYMBOL_MAP).map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>
          <button
            onClick={handleGenerateQR}
            className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg mt-2 transition"
          >
            Generar QR
          </button>
        </div>

        {/* MOSTRAR QR */}
        {qrData && (
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <QRCode value={qrData} size={180} />
          </motion.div>
        )}

        {/* ESCANEAR QR (simulado para demo) */}
        <div className="mb-4 text-center">
          <button
            onClick={() => handleScanQR(qrData)}
            className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded-lg transition"
          >
            Escanear este QR (simulado)
          </button>
        </div>

        {/* BOTÓN DE PAGO */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full py-2 rounded-lg ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white transition`}
        >
          {loading ? "Procesando..." : "Pagar ahora"}
        </button>

        <p className="mt-4 text-sm text-gray-600 text-center">{status}</p>
      </motion.div>
    </div>
  );
}

// ✅ Alias opcional para compatibilidad con importaciones antiguas
export const PayBlockWithQR = PayComponent;
