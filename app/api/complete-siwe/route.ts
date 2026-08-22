import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

type RequestBody = {
  payload: {
    address: string;
    message: string;
    signature: string;
  };
  nonce: string;
};

export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as RequestBody;

    // 1. Validamos que el nonce de la petición coincida con la cookie
    const cookieStore = cookies();
    const savedNonce = cookieStore.get("siwe")?.value;

    if (!nonce || nonce !== savedNonce) {
      return NextResponse.json(
        { isValid: false, error: "Invalid nonce" },
        { status: 400 }
      );
    }

    // 2. Verificamos la firma criptográfica con Viem
    const isValid = await verifyMessage({
      address: payload.address as `0x${string}`,
      message: payload.message,
      signature: payload.signature as `0x${string}`,
    });

    if (!isValid) {
      return NextResponse.json(
        { isValid: false, error: "Invalid signature" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      isValid: true,
      address: payload.address,
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
