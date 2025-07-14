import { redirect } from "next/navigation"
import { PagesProgressProvider as ProgressProvider } from '@bprogress/next';

export default function Home() {
  redirect("/dashboard")
}
