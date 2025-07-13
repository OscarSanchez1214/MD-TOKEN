import { PayBlock } from "@/components/Pay";
import { SignIn } from "@/components/SignIn";
import { VerifyBlock } from "@/components/Verify";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4 py-10">
      <div className="w-full max-w-md space-y-6 text-center">
        <SignIn />
        <VerifyBlock />
        <PayBlock />
      </div>
    </main>
  );
}
