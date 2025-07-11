'use client';

import { useState } from 'react';
import { MiniKit, VerificationLevel } from '@worldcoin/minikit-js';

export function VerifyBlock() {
  const [status, setStatus] = useState('Esperando verificación...');

  const verifyPayload = {
    action: 'voting-action', // ⚠️ Asegúrate de que este ID exista en developer.worldcoin.org
    signal: '0x12312',
    verification_level: VerificationLevel.Orb, // Puedes cambiar a .Device para pruebas
  };

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setStatus('❌ MiniKit no está instalado. Abre esta MiniApp desde World App.');
      return;
    }

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      // 👇 Mostrar código de error exacto si falla
      if (finalPayload.status === 'error') {
        console.error("Falló verificación:", finalPayload);
        setStatus(`❌ Verificación fallida. Código: ${finalPayload.error_code ?? 'desconocido'}`);
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

      // ✅ Estado según la respuesta del servidor
      if (result.success || result.status === 200) {
        setStatus('✅ Verificación exitosa');
      } else {
        console.error('Respuesta del servidor inesperada:', result);
        setStatus('❌ Verificación fallida (backend)');
      }

    } catch (err) {
      console.error('Error inesperado:', err);
      setStatus('❌ Ocurrió un error en la verificación.');
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <h2 className="text-xl font-bold mb-2">Verificación de Identidad</h2>
      <p className="mb-2">{status}</p>
      <button
        onClick={handleVerify}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Verificar con World ID
      </button>
    </div>
  );
}
