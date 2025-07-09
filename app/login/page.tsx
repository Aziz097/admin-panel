import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative flex items-center justify-center p-6 md:p-10">
        <div className="absolute left-6 top-6 flex items-center gap-2 md:left-10 md:top-10">
        <img 
            src="/bumn.png" 
            alt="LOGO BUMN" 
            className="mr-4 max-h-6 object-contain"
          />
          <img
            src="/logo-upt-tkr.png"
            alt="UPT PLN Logo"
            className="max-h-8 object-contain"
          />
        </div>
        <div className="w-full max-w-xs">
          <LoginForm />
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/landing-login.jpeg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}