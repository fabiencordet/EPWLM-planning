"use client";

import { signOut } from "next-auth/react";

type SignOutButtonProps = {
  callbackUrl?: string;
  className?: string;
  label?: string;
};

export default function SignOutButton({
  callbackUrl = "/",
  className,
  label = "Se deconnecter",
}: SignOutButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => void signOut({ callbackUrl })}
      aria-label={label}
      title={label}
    >
      <span className="material-symbols-rounded text-[20px] leading-none" aria-hidden="true">
        logout
      </span>
    </button>
  );
}