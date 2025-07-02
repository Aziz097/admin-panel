"use server";

import { SignInValues } from "./form-schemas";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export const signInAction = async (signInValues: SignInValues) => {
  try {
    await signIn("credentials", {
      redirect: false,
      ...signInValues,
    });
    return { success: true };
  } catch (error) {

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials. Please check your email or password." };
        default:
          return { error: "Authentication error. Please try again." };
      }
    }

    return { error: "Unexpected error occurred. Please try again later." };
  }
};

export const signOutAction = async (): Promise<{ success?: boolean; error?: string }> => {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    return { error: "Failed to sign out. Please try again." };
  }
}
