'use client'
import React, { useState, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { getTokenDetails, sendMyToken, MY_TOKEN_ADDRESS } from '@/lib/token'

export default function TokenWallet() {
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [decimals, setDecimals] = useState<number>(18)
  const [symbol, setSymbol] = useState<string>('MD')
  
  const [recipient, setRecipient] = useState<string>('')
  const [amount, setAmount] = useState<string>('')

  // 1. INICIAR SESIÓN (Obtener Wallet)
  useEffect(() => {
    const address = (MiniKit.user as any)?.walletAddress
    if (address) {
      setWalletAddress(address)
      loadTokenData(address as `0x${string}`)
    }
  }, [])

  // 2. LEER SALDO
  const loadTokenData = async (addr: `0x${string}`) => {
    const details = await getTokenDetails(addr)
    setBalance(details.balance)
    setDecimals(details.decimals)
    setSymbol(details.symbol)
  }

  // 3. ENVIAR TOKENS
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await sendMyToken(walletAddress as `0x${string}`, recipient as `0x${string}`, amount, decimals)
      alert("✅ Envío exitoso")
      loadTokenData(walletAddress as `0x${string}`) // Recargar saldo
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-3xl shadow-sm border space-y-6">
      <h2 className="text-2xl font-bold">Wallet {symbol}</h2>
      <div className="p-4 bg-blue-50 rounded-xl">
        <p>Saldo: {balance} {symbol}</p>
      </div>
      <form onSubmit={handleSend} className="space-y-4">
        <input type="text" placeholder="Destino (0x...)" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full p-3 border rounded-xl" required />
        <input type="number" step="any" placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-xl" required />
        <button type="submit" className="w-full bg-black text-white p-3 rounded-xl">Enviar</button>
      </form>
    </div>
  )
}
