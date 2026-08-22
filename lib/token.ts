import { createPublicClient, http, formatUnits, parseUnits, type Address } from 'viem'
import { MiniKit } from '@worldcoin/minikit-js'

export const WORLD_CHAIN_ID = 480
export const MY_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ||
  '0x6335c1F2967A85e98cCc89dA0c87e672715284dB') as Address

const RPC =
  process.env.NEXT_PUBLIC_WORLDCHAIN_RPC ||
  'https://worldchain-mainnet.g.alchemy.com/public'

const client = createPublicClient({
  chain: {
    id: WORLD_CHAIN_ID,
    name: 'World Chain',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [RPC] } }
  },
  transport: http(RPC)
})

const erc20Abi = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }]
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }]
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const

export async function getTokenDetails(wallet: Address) {
  const [rawBalance, decimals, symbol] = await Promise.all([
    client.readContract({
      address: MY_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [wallet]
    }),
    client.readContract({
      address: MY_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'decimals'
    }),
    client.readContract({
      address: MY_TOKEN_ADDRESS,
      abi: erc20Abi,
      functionName: 'symbol'
    })
  ])

  return {
    balance: formatUnits(rawBalance, decimals),
    symbol,
    decimals
  }
}

export async function sendMyToken(
  recipient: Address,
  amount: string,
  decimals: number
): Promise<string> {
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
    throw new Error('La dirección destino no es válida.')
  }

  if (!amount || Number(amount) <= 0) {
    throw new Error('El monto debe ser mayor que cero.')
  }

  if (!MiniKit.isInstalled()) {
    throw new Error('Abre esta aplicación dentro de World App para enviar tokens.')
  }

  const parsedAmount = parseUnits(amount, decimals)

  const response = await (MiniKit as any).sendTransaction({
    chainId: WORLD_CHAIN_ID,
    transactions: [
      {
        address: MY_TOKEN_ADDRESS,
        abi: erc20Abi,
        functionName: 'transfer',
        args: [recipient, parsedAmount]
      }
    ]
  })

  const finalPayload = response?.finalPayload || response?.data

  if (!finalPayload || finalPayload.status === 'error') {
    throw new Error('La transacción fue rechazada o falló en World App.')
  }

  return finalPayload.userOpHash || 'Transacción enviada correctamente'
}
