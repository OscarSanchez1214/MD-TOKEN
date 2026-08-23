import { createPublicClient, http, formatUnits, parseUnits, encodeFunctionData, type Address } from 'viem'
import { MiniKit } from '@worldcoin/minikit-js' 

export const WORLD_CHAIN_ID = 480
export const MY_TOKEN_ADDRESS = '0x_TU_CONTRATO_AQUI' as Address
const RPC = 'https://worldchain-mainnet.g.alchemy.com/public'

// 1. Cliente público para LEER la blockchain
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

// 2. Función para LEER saldo
export async function getTokenDetails(wallet: Address) {
  const [rawBalance, decimals, symbol] = await Promise.all([
    client.readContract({ address: MY_TOKEN_ADDRESS, abi: erc20Abi, functionName: 'balanceOf', args: [wallet] }),
    client.readContract({ address: MY_TOKEN_ADDRESS, abi: erc20Abi, functionName: 'decimals' }),
    client.readContract({ address: MY_TOKEN_ADDRESS, abi: erc20Abi, functionName: 'symbol' })
  ])
  return { balance: formatUnits(rawBalance, decimals), symbol, decimals }
}

// 3. Función para ENVIAR tokens (Escritura)
export async function sendMyToken(sender: Address, recipient: Address, amount: string, decimals: number): Promise<string> {
  const parsedAmount = parseUnits(amount, decimals);
  
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [recipient, parsedAmount],
  });

  const response = await MiniKit.sendTransaction({
    chainId: WORLD_CHAIN_ID,
    transactions: [{ to: MY_TOKEN_ADDRESS, data }],
  });

  const resultData = (response as any)?.data;
  if (!resultData || resultData.status !== "success") throw new Error("Transacción fallida o cancelada");
  
  return resultData.transactionHash || resultData.userOpHash || "Éxito";
}
