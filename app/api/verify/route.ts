import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { NextRequest, NextResponse } from "next/server";

interface IRequestPayload {
  payload: ISuccessResult;
  action: string;
  signal: string | undefined;
}

export async function POST(req: NextRequest) {
  try {
    const { payload, action, signal } = (await req.json()) as IRequestPayload;
    const app_id = process.env.APP_ID as `app_${string}`;

    const verifyRes: IVerifyResponse = await verifyCloudProof(
      payload,
      app_id,
      action,
      signal
    );

    console.log("Resultado verificación:", verifyRes);

    // ✅ ACEPTA tanto verificación exitosa como ya verificada anteriormente
    if (verifyRes.success || verifyRes.code === "already_verified") {
      return NextResponse.json({ success: true, verifyRes }, { status: 200 });
    }

    return NextResponse.json({ success: false, verifyRes }, { status: 400 });

  } catch (error) {
    console.error("Error en verificación:", error);
    return NextResponse.json({ success: false, error: "internal_error" }, { status: 500 });
  }
}
