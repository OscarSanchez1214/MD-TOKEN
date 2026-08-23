import { createPublicClient, http, formatUnits, parseUnits, type Address } from 'viem'
import { MiniKit } from '@worldcoin/minikit-js' 

export const WORLD_CHAIN_ID = 480
// 1. Contrato oficial de MD Token
export const MY_TOKEN_ADDRESS = '0x6335c1F2967A85e98cCc89dA0c87e672715284dB' as Address

const RPC = 'https://worldchain-mainnet.g.alchemy.com/public'

// Cliente público para LEER la blockchain
const client = createPublicClient({
  chain: { id: WORLD_CHAIN_ID, name: 'World Chain', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } },
  transport: http(RPC)
})

const erc20Abi = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'string' }] },
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ name: '', type: 'bool' }] }
] as const

// Función para LEER saldo
export async function getTokenDetails(wallet: Address) {
  try {
    const [rawBalance, decimals, symbol] = await Promise.all([
      client.readContract({ address: MY_TOKEN_ADDRESS, abi: erc20Abi, functionName: 'balanceOf', args: [wallet] }),
      client.readContract({ address: MY_TOKEN_ADDRESS, abi: erc20Abi, functionName: 'decimals' }),
      client.readContract({ address: MY_TOKEN_ADDRESS, abi: erc20Abi, functionName: 'symbol' })
    ])
    return { balance: formatUnits(rawBalance, decimals), symbol, decimals }
  } catch (error) {
    console.error("Error leyendo saldo:", error)
    return { balance: "0", symbol: "MD", decimals: 18 }
  }
}

// Función para ENVIAR tokens (Escritura)
export async function sendMyToken(sender: Address, recipient: Address, amount: string, decimals: number): Promise<string> {
  const parsedAmount = parseUnits(amount, decimals);
  
  // 2. Corrección del payload para evitar el error "reading map"
  const payload = {
    transaction: [
      {
        address: MY_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: "transfer",
        args: [recipient, parsedAmount.toString()],
      }
    ]
  };

  let response: any;
  
  // Compatibilidad para diferentes versiones de MiniKit
  if (MiniKit.commandsAsync?.sendTransaction) {
    response = await MiniKit.commandsAsync.sendTransaction(payload);
  } else {
    // @ts-ignore
    response = await MiniKit.commands.sendTransaction(payload);
  }

  const resultData = response?.finalPayload || response;

  if (!resultData || resultData.status !== "success") {
    throw new Error("Transacción fallida o cancelada por el usuario");
  }
  
  return resultData.transactionHash || "Éxito";
}
