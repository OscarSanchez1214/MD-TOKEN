'use client'

import React, { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { getTokenDetails, sendMyToken } from '@/lib/token'

export default function TokenWallet() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [decimals, setDecimals] = useState<number>(18)
  const [symbol, setSymbol] = useState<string>('MD')
  
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [isSending, setIsSending] = useState<boolean>(false)

  // 1. INICIAR SESIÓN (Obtener Wallet)
  useEffect(() => {
    // CORRECCIÓN TIPADO: Evitamos error en Vercel casteando (MiniKit as any)
    const address = (MiniKit as any).walletAddress || (MiniKit as any).user?.walletAddress;
    
    if (address) {
      setWalletAddress(address)
      loadTokenData(address as `0x${string}`)
    }
  }, [])

  // 2. LEER SALDO
  const loadTokenData = async (addr: `0x${string}`) => {
    try {
      const details = await getTokenDetails(addr)
      setBalance(details.balance)
      setDecimals(details.decimals)
      setSymbol(details.symbol)
    } catch (error) {
      console.error("Error al cargar saldo:", error)
    }
  }

  // 3. ENVIAR TOKENS
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    
    try {
      await sendMyToken(
        walletAddress as `0x${string}`, 
        recipient as `0x${string}`, 
        amount, 
        decimals
      )
      alert("✅ Envío exitoso")
      setRecipient('')
      setAmount('')
      loadTokenData(walletAddress as `0x${string}`) // Recargar saldo
    } catch (error: any) {
      alert(`❌ Error: ${error.message || 'No se pudo completar'}`)
    } finally {
      setIsSending(false)
    }
  }

  if (!walletAddress) {
    return <div className="p-4 text-center text-sm text-gray-500">Cargando billetera... Asegúrate de iniciar sesión.</div>
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-3xl shadow-sm border border-gray-200 space-y-6 text-black">
      <h2 className="text-2xl font-bold">Wallet {symbol}</h2>
      
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="font-semibold">Saldo: {balance} {symbol}</p>
        <p className="text-[10px] text-gray-500 mt-1 break-all">Dir: {walletAddress}</p>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <input 
          type="text" 
          placeholder="Destino (0x...)" 
          value={recipient} 
          onChange={(e) => setRecipient(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600" 
          required 
        />
        <input 
          type="number" 
          step="any" 
          min="0"
          placeholder="Monto" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600" 
          required 
        />
        <button 
          type="submit" 
          disabled={isSending}
          className="w-full bg-black text-white p-3 rounded-xl disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
        >
          {isSending ? 'Firmando envío...' : 'Enviar Tokens'}
        </button>
      </form>
    </div>
  )
}
