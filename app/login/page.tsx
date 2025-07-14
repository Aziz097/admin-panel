import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex items-center justify-center p-6 md:p-10">
        <div className="absolute left-6 top-6 flex items-center gap-2 md:left-10 md:top-10">
        <Image 
            src="/danantara.png" 
            width={150}
            height={150}
            alt="Logo Danantara" 
            className="mr-4 max-h-6 object-contain"
          />
          <Image
            src="/logo-upt-tkr.png"
            width={150}
            height={150}
            alt="UPT PLN Logo"
            className="max-h-8 object-contain"
          />
        </div>
        <div className="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/landing-login.jpeg"
          width={800}
          height={800}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}