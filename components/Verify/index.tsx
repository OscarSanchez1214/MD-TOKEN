'use client';

import { useState } from 'react';
import {
  MiniKit,
  VerificationLevel,
  ISuccessResult,
} from '@worldcoin/minikit-js';

export function VerifyBlock() {
  const [estado, setEstado] = useState('🔄 Esperando verificación...');

  const verifyPayload = {
    action: 'vota-por-proyecto', // Debe coincidir exactamente con lo registrado en el Developer Portal
    signal: 'usuario-unico',     // Puedes usar un identificador específico si lo deseas
    verification_level: VerificationLevel.Orb,
  };

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setEstado('❌ MiniKit no está instalado. Abre esta MiniApp desde World App.');
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      console.log("Payload recibido:", finalPayload);

      if (finalPayload.status === 'error') {
        setEstado('❌ Verificación cancelada o fallida.');
        return;
      }

      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: finalPayload,
          action: verifyPayload.action,
          signal: verifyPayload.signal,
        }),
      });

      const result = await response.json();
      console.log("Resultado de verificación:", result);

      setEstado(result.success ? '✅ Verificación exitosa' : '❌ Verificación fallida');
    } catch (err) {
      console.error('Error en el proceso de verificación:', err);
      setEstado('❌ Error inesperado durante la verificación.');
    }
  };

  return (
    <div className="flex flex-col items-center mt-6 text-center">
      <h2 className="text-xl font-bold mb-2">Verificación con World ID</h2>
      <p className="mb-3">{estado}</p>
      <button
        onClick={handleVerify}
        className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg shadow-md"
      >
        Verificar Identidad
      </button>
    </div>
  );
}
