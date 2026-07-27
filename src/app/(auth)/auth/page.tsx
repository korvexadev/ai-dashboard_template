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
      <aside className="auth-editorial">
        <div className="auth-brand">
          <BrandMark />
          <span>Mikozi</span>
        </div>
        <div className="auth-editorial-copy">
          <p className="eyebrow">The newsroom</p>
          <h2>Every edition starts with a clear point of view.</h2>
          <p>
            Plan, shape and publish journalism that feels local, timely and
            unmistakably Mikozi.
          </p>
        </div>
        <div className="auth-edition">
          <span>MW</span>
          <span>Editorial workspace</span>
          <span>2026</span>
        </div>
      </aside>
      <AuthForm />
    </main>
  );
}
