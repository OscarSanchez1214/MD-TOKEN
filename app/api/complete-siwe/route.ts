import { NextRequest, NextResponse } from "next/server";
import { verifyMessage, type Address } from "viem";

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = await req.json();

    // El payload de MiniKit walletAuth devuelve: { address, message, signature }
    const { address, message, signature } = payload;

    if (!address || !message || !signature) {
      return NextResponse.json(
        { isValid: false, error: "Payload incompleto" },
        { status: 400 }
      );
    }

    // Validamos opcionalmente que el nonce esté presente en el mensaje firmado
    if (!message.includes(nonce)) {
      return NextResponse.json(
        { isValid: false, error: "Nonce inválido o no coincide" },
        { status: 400 }
      );
    }

    // Verificamos criptográficamente la firma utilizando viem
    const isValid = await verifyMessage({
      address: address as Address,
      message,
      signature: signature as `0x${string}`,
    });

    return NextResponse.json({
      isValid,
      address,
    });
    
  } catch (error: any) {
    return NextResponse.json(
      {
        isValid: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 400 }
    );
  }
}
