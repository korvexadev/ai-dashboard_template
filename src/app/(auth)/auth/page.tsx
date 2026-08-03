import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { BrandMark } from "@/components/brand/brand-mark";
import { AuthForm } from "@/features/auth/components/auth-form";
import { REFRESH_COOKIE } from "@/lib/auth/cookies";

export default async function AuthPage() {
  const cookieStore = await cookies();
  if (cookieStore.has(REFRESH_COOKIE)) redirect("/");

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <BrandMark />
        <span>Mikozi</span>
      </div>
      <AuthForm />
    </main>
  );
}
