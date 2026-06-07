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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h3a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 17l5-5-5-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H3" />
      </svg>
    </button>
  );
}