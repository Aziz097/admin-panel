"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"button"> & {
  pendingText: string;
};

export function SubmitButton({ children, pendingText, className, ...props }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      aria-disabled={pending}
      className={cn("rounded-md p-2 px-4", className)}
    >
      {pending ? pendingText : children}
    </button>
  );
}
