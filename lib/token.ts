import { createPublicClient, http, formatUnits, parseUnits } from 'viem'
import { MiniKit } from '@worldcoin/minikit-js'

// Dirección de tu Token MD en World Chain
export const MY_TOKEN_ADDRESS = '0x6335c1F2967A85e98cCc89dA0c87e672715284dB' as const

// Cliente de lectura para World Chain
export const publicClient = createPublicClient({
  chain: {
    id: 480,
    name: 'World Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://worldchain-mainnet.g.alchemy.com/public'] } }
  },
  transport: http()
})

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    name: 'decimals',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view'
  },
  {
    name: 'symbol',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view'
  }
] as const

// Función para obtener balance y detalles
export async function getTokenDetails(userAddress: `0x${string}`) {
  try {
    const [rawBalance, decimals, symbol] = await Promise.all([
      publicClient.readContract({
        address: MY_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [userAddress]
      }),
      publicClient.readContract({
        address: MY_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'decimals'
      }),
      publicClient.readContract({
        address: MY_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'symbol'
      })
    ])

    // Se fuerza el tipado a bigint y number para que Next.js/Vercel no bloquee el build
    const formattedBalance = formatUnits(rawBalance as bigint, Number(decimals))
    return { balance: formattedBalance, decimals: Number(decimals), symbol: String(symbol) }
  } catch (error) {
    console.error('Error leyendo contrato ERC-20:', error)
    return { balance: '0', decimals: 18, symbol: 'MD' }
  }
}

// Función para enviar tokens usando World App / MiniKit
export async function sendMyToken(recipientAddress: string, amount: string, decimals: number) {
  if (!MiniKit.isInstalled()) {
    throw new Error('MiniKit no está disponible fuera de World App.')
  }

  const amountInWei = parseUnits(amount, decimals)

  // Usamos commandsAsync y forzamos el tipado de respuesta para evitar errores de TypeScript en Vercel
  const response = await (MiniKit as any).commandsAsync.sendTransaction({
    transaction: [
      {
        address: MY_TOKEN_ADDRESS,
        abi: [
          {
            name: 'transfer',
            type: 'function',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'value', type: 'uint256' }
            ],
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable'
          }
        ],
        functionName: 'transfer',
        args: [recipientAddress, amountInWei.toString()]
      }
    ]
  })

  const finalPayload = response?.finalPayload

  if (!finalPayload || finalPayload.status === 'error') {
    throw new Error('Transacción cancelada o fallida')
  }

  return finalPayload.transactionHash as string
}
