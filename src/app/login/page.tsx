import LoginForm from "@/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/admin";

  return (
    <main className="min-h-screen bg-gradient-to-b from-cyan-50 to-white px-4 py-12">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-cyan-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Connexion entraîneur / admin</h1>
        <p className="mt-2 text-sm text-slate-600">
          Démo: deborah.wattelier@epwlm.local / coach123, camille.zouita@epwlm.local /
          coach123, angela.tamburrino@epwlm.local / coach123, admin@epwlm.local / admin123
        </p>
        <LoginForm callbackUrl={callbackUrl} />
      </section>
    </main>
  );
}
