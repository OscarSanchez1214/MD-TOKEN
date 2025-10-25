"use client";

import { useEffect, useRef, useState } from "react";
import {
  MiniKit,
  PayCommandInput,
} from "@worldcoin/minikit-js";
import { Html5Qrcode } from "html5-qrcode";
import { ethers } from "ethers";

// --- CONFIG ---
const MD_TOKEN_ADDRESS = "0x6335c1F2967A85e98cCc89dA0c87e672715284dB";
const DEFAULT_DECIMALS = 18;
// ---------------

// Convierte monto humano (string/number) a unidades (string) según decimales (sin floats)
function amountToUnits(amount: string | number, decimals: number): string {
  const amtStr = typeof amount === "number" ? amount.toString() : amount;
  if (!/^\d+(\.\d+)?$/.test(amtStr)) throw new Error("Formato de monto inválido");
  const [wholePart, fractionPart = ""] = amtStr.split(".");
  if (fractionPart.length > decimals) {
    throw new Error(`Más decimales de los permitidos: ${decimals}`);
  }
  const fractionPadded = fractionPart.padEnd(decimals, "0");
  const wholeBig = BigInt(wholePart);
  const fractionBig = BigInt(fractionPadded || "0");
  const units = wholeBig * (10n ** BigInt(decimals)) + fractionBig;
  return units.toString();
}

// Intenta leer decimals del contrato ERC-20 vía provider (si existe window.ethereum)
async function fetchTokenDecimals(tokenAddress: string): Promise<number> {
  try {
    if ((window as any).ethereum) {
      const provider = new ethers.providers.Web3Provider((window as any).ethereum);
      const erc20 = new ethers.Contract(
        tokenAddress,
        ["function decimals() view returns (uint8)"],
        provider
      );
      const d: number = await erc20.decimals();
      return d;
    }
  } catch (e) {
    console.warn("No se pudo leer decimals desde provider:", e);
  }
  // fallback
  return DEFAULT_DECIMALS;
}

// Parseo flexible del contenido escaneado
function parseQrContent(text: string) {
  // 1) JSON puro en el QR: {"address":"0x...", "amount":"1.5"}
  try {
    const j = JSON.parse(text);
    if (j.address) return { address: j.address, amount: j.amount?.toString() ?? null };
  } catch (e) {
    // no JSON
  }

  // 2) ethereum: URI -> ethereum:0xAbc...?value=1000000000000000000
  if (text.startsWith("ethereum:") || text.startsWith("wc:") || text.startsWith("md:")) {
    // separar por ":" y luego por "?"
    const withoutScheme = text.split(":")[1] ?? text;
    const [maybeAddress, query] = withoutScheme.split("?");
    const params = new URLSearchParams(query || "");
    let amount = null;
    if (params.get("amount")) amount = params.get("amount");
    if (params.get("value")) amount = params.get("value"); // a veces vienen en wei
    return { address: maybeAddress, amount };
  }

  // 3) formato address + optional amount separado por espacio, e.g. "0x.. 1.5"
  const parts = text.trim().split(/\s+/);
  if (ethers.utils.isAddress(parts[0])) {
    return { address: parts[0], amount: parts[1] ?? null };
  }

  // 4) si el texto es solo una dirección
  if (ethers.utils.isAddress(text.trim())) return { address: text.trim(), amount: null };

  return null;
}

export const PayBlockWithQR = () => {
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<{ address: string; amount?: string } | null>(null);
  const readerRef = useRef<Html5Qrcode | null>(null);
  const html5QrId = "html5qr-reader";

  useEffect(() => {
    return () => {
      // cleanup
      if (readerRef.current) {
        readerRef.current.stop().catch(() => {});
        readerRef.current.clear().catch(() => {});
      }
    };
  }, []);

  const startScanner = async () => {
    setDetected(null);
    setScanning(true);
    const html5Qr = new Html5Qrcode(html5QrId, /* verbose= */ false);
    readerRef.current = html5Qr;
    try {
      await html5Qr.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: 250,
        },
        (decodedText) => {
          const parsed = parseQrContent(decodedText);
          if (parsed?.address) {
            setDetected(parsed);
            // detener scanner al detectar
            html5Qr.stop().then(() => {
              setScanning(false);
            }).catch(()=>setScanning(false));
          } else {
            // no válido: opcional mostrar error breve
            console.warn("QR no contiene dirección válida:", decodedText);
          }
        },
        (errorMessage) => {
          // console.log("QR no detectado todavía", errorMessage);
        }
      );
    } catch (err) {
      console.error("Error al iniciar scanner:", err);
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (readerRef.current) {
      await readerRef.current.stop().catch(() => {});
      await readerRef.current.clear().catch(() => {});
      readerRef.current = null;
    }
    setScanning(false);
  };

  const enviarPago = async (to: string, amountHuman?: string) => {
    try {
      // inicia pago en servidor si lo usas (como hiciste antes)
      const res = await fetch(`/api/initiate-payment`, { method: "POST" });
      const { id } = await res.json();

      // obtener decimales (intentar onchain)
      const decimals = await fetchTokenDecimals(MD_TOKEN_ADDRESS);

      // si amountHuman es null, puedes pedir al usuario ingresarlo.
      if (!amountHuman) {
        amountHuman = prompt("Ingresa el monto en MD (ej: 1.5)") || undefined;
        if (!amountHuman) {
          alert("Monto no ingresado, cancelando.");
          return null;
        }
      }

      const tokenAmount = amountToUnits(amountHuman, decimals);

      const payload: PayCommandInput = {
        reference: id,
        to,
        tokens: [
          {
            symbol: "MD",
            token_address: MD_TOKEN_ADDRESS,
            token_amount: tokenAmount,
          },
        ],
        description: `Pago MD a ${to}`,
      };

      if (!MiniKit.isInstalled()) {
        alert("Abre esta MiniApp desde World App para realizar el pago.");
        return null;
      }

      const response = await MiniKit.commandsAsync.pay(payload);
      return response;
    } catch (e) {
      console.error("Error enviando pago:", e);
      alert("Error al intentar enviar el pago.");
      return null;
    }
  };

  const handleUseDetected = async () => {
    if (!detected) return;
    const to = detected.address;
    const amount = detected.amount ?? undefined;

    const respuesta = await enviarPago(to, amount);
    const resultado = respuesta?.finalPayload;
    if (!resultado) return;

    if (resultado.status === "success") {
      // confirmar con tu /api/confirm-payment como en tu flujo original
      const confirmRes = await fetch(`/api/confirm-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: resultado }),
      });
      const json = await confirmRes.json();
      if (json.success) alert("✅ Pago MD realizado con éxito");
      else alert("❌ El pago no se pudo confirmar en servidor");
    } else {
      alert("❌ El pago fue cancelado o falló");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Enviar MD (scan QR)</h2>

      <div className="mb-3">
        {!scanning && (
          <button
            onClick={startScanner}
            className="bg-green-600 text-white px-3 py-2 rounded mr-2"
          >
            Iniciar escáner QR
          </button>
        )}
        {scanning && (
          <button
            onClick={stopScanner}
            className="bg-red-600 text-white px-3 py-2 rounded mr-2"
          >
            Detener escáner
          </button>
        )}
      </div>

      <div id={html5QrId} style={{ width: 300, height: 300, marginBottom: 12 }} />

      {detected ? (
        <div className="border p-3 rounded">
          <p>Dirección detectada: <code>{detected.address}</code></p>
          <p>Monto detectado: <strong>{detected.amount ?? "No especificado"}</strong></p>
          <div className="mt-2">
            <button
              onClick={handleUseDetected}
              className="bg-blue-600 text-white px-3 py-2 rounded mr-2"
            >
              Enviar a esta dirección
            </button>
            <button
              onClick={() => setDetected(null)}
              className="bg-gray-300 px-3 py-2 rounded"
            >
              Escanear otro
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">Ningún destino detectado aún.</p>
      )}

      <hr className="my-3" />

      <div>
        <p className="text-sm">También puedes ingresar manualmente:</p>
        <ManualSendForm onSend={enviarPago} />
      </div>
    </div>
  );
};

// Formulario pequeño para enviar manualmente
const ManualSendForm = ({ onSend }: { onSend: (to: string, amount?: string) => Promise<any> }) => {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const submit = async () => {
    if (!ethers.utils.isAddress(to)) {
      alert("Dirección inválida");
      return;
    }
    await onSend(to, amount || undefined);
  };
  return (
    <div className="mt-2">
      <input
        placeholder="Dirección destino"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        placeholder="Monto MD (ej: 1.5)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={submit} className="bg-blue-600 text-white px-3 py-2 rounded">
        Enviar MD
      </button>
    </div>
  );
};

