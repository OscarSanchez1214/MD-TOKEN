import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type { MiniAppWalletAuthSuccessPayload } from "@worldcoin/minikit-js/commands";
import { verifySiweMessage } from "@worldcoin/minikit-js/siwe";

type RequestBody = {
  payload: MiniAppWalletAuthSuccessPayload;
  nonce: string;
};

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as RequestBody;

    // Validamos que el nonce coincida con la cookie
    if (nonce !== cookies().get("siwe")?.value) {
      return NextResponse.json(
        { isValid: false, error: "Invalid nonce" },
        { status: 400 }
      );
    }

    // Verificamos la firma con la red de World Chain
    const verification = await verifySiweMessage(payload, nonce);

    return NextResponse.json({
      isValid: verification.isValid,
      address: verification.siweMessageData.address,
    });
  } catch (error) {
    return NextResponse.json(
      {
        isValid: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}
