"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  callbackUrl: string;
};

export default function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("deborah.wattelier@epwlm.local");
  const [password, setPassword] = useState("coach123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Identifiants invalides.");
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm">
        Email
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="grid gap-1 text-sm">
        Mot de passe
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      {error && <p className="text-sm text-rose-700">{error}</p>}

      <button
        className="rounded-md bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}
