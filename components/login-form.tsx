"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signInAction } from "@/lib/actions"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { toast } from "sonner" // Import toast

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFormSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    setLoading(true)
    setError(null)

    const res = await signInAction({ email, password })

    setLoading(false)

    if (res.error) {
      setError(res.error)
      toast.error(res.error) // Show error toast
      return
    }

    toast.success("Login successful!") // Show success toast
    window.location.href = "/dashboard"
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={(e) => {
        e.preventDefault()
        const formData = new FormData(e.target as HTMLFormElement)
        handleFormSubmit(formData)
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email and password to continue
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@example.com"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              name="password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center -mt-2">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full bg-sky-400" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </form>
  )
}
