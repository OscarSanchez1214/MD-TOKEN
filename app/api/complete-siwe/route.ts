import { NextRequest, NextResponse } from "next/server";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = await req.json();

    // Utilizamos la herramienta oficial de verificación del SDK
    const verification = await verifySiweMessage(
      payload,
      nonce
    );

    return NextResponse.json({
      isValid: verification.isValid,
      address: verification.siweMessageData.address,
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
