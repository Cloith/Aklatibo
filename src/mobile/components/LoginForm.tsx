"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isGoogleReady, setIsGoogleReady] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const initGoogleSignIn = async () => {
    try {
      await GoogleSignIn.initialize({
        clientId:
          "467701279315-ktockmdgpkba43de9409aborcnrp8h9m.apps.googleusercontent.com",
      });
      console.log("Google Sign-In initialized successfully.");
      setIsGoogleReady(true);
    } catch (error: unknown) {
      console.error("Failed to initialize Google Sign-In:", error);
      let errorMessage = "";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "message" in error
      ) {
        errorMessage = String((error as { message: unknown }).message);
      } else {
        errorMessage = String(error);
      }

      if (
        errorMessage.includes("already initialized") ||
        errorMessage.includes("already exists")
      ) {
        console.warn("Google Sign-In already initialized. Continuing...");
        setIsGoogleReady(true);
        return;
      }
      setIsGoogleReady(false);
    }
  };

  useEffect(() => {
    initGoogleSignIn();
  }, []);

  // Accept the form submission event to prevent the full page reload
  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    try {
      setIsLoading(true);
      const response = await fetch(
        "https://api.aklatibo.site/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert("Login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      console.log("Triggering native Google Sign-In interaction...");
      
      const result = await GoogleSignIn.signIn();
      console.log("Native Google Sign-In result received:", result);

      // CRITICAL GUARD: If the token is completely missing, native layer succeeded but configuration failed
      if (!result || !result.idToken) {
        throw new Error("Google did not return an ID token. Check your client ID configuration or keystore SHA-1 fingerprints.");
      }

      const payload = { token: result.idToken };
      console.log("Sending payload to backend auth route...");

      const response = await fetch(
        "https://api.aklatibo.site/api/auth/google",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      console.log(`Backend responded with status: ${response.status}`);
      
      // Safety check if response text is blank or non-JSON
      const textData = await response.text();
      let data;
      try {
        data = textData ? JSON.parse(textData) : {};
      } catch (e) {
        throw new Error(`Invalid response from server: ${textData || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data.message ?? `Authentication failed with status ${response.status}`);
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Authentication successful, redirecting...");
      router.push("/dashboard");
      
    } catch (error: unknown) {
      console.error("Sign-in interaction crashed entirely:", error);
      
      const errorCode = String(
        (error as any)?.code || (error as any)?.message || error
      );

      // Gracefully ignore user cancellations
      if (
        errorCode === "12501" ||
        errorCode.toLowerCase().includes("cancel") ||
        errorCode.toLowerCase().includes("user canceled")
      ) {
        console.log("Sign-in gracefully aborted by user interaction.");
        return;
      }
      
      // This will catch missing tokens, backend 500s, and json parsing issues
      alert(`Google Login failed: ${errorCode}`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6 text-slate-800 select-none", className)}
      {...props}
    >
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="text-center pt-8 pb-3">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-800">
            Welcome
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs mt-1">
            Access your secure digital learning workspace
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-8">
          {/* FIX: Moved standard submission trigger directly to the form handler */}
          <form onSubmit={login} className="space-y-3">
            <FieldGroup className="space-y-3">
              <Field>
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={googleSignIn}
                  disabled={!isGoogleReady || isLoading || isGoogleLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white hover:text-white border-transparent transition active:scale-[0.98] py-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none shadow-md"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                      Connecting session...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4 text-white">
                        <path
                          d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                          fill="currentColor"
                        />
                      </svg>
                      Continue with Google
                    </>
                  )}
              </Button>
              </Field>

              <FieldSeparator className="text-slate-400 font-mono text-[10px] uppercase tracking-wider before:border-slate-200 after:border-slate-200 *:data-[slot=field-separator-content]:bg-transparent *:data-[slot=field-separator-content]:text-slate-400">
                Or secure email sign-in
              </FieldSeparator>

              <Field className="space-y-0.5 -mt-3">
                <FieldLabel htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Email Address
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full bg-white/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 rounded-xl px-3.5 py-5 transition text-sm disabled:opacity-40 shadow-sm"
                  required
                />
              </Field>

              <Field className="space-y-0.5 -mt-3">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Password
                  </FieldLabel>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isGoogleLoading}
                    className="w-full bg-white/70 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 rounded-xl pl-3.5 pr-10 py-5 transition text-sm disabled:opacity-40 shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isGoogleLoading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1 disabled:opacity-40"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Field className="pt-2">
                {/* FIX: Removed onClick from button to let native form validation execute seamlessly */}
                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white transition active:scale-[0.98] py-5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/10 disabled:opacity-40"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating credentials...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <FieldDescription className="text-center text-xs text-slate-500 mt-4">
                  Don&apos;t have an account?{" "}
                  <Link
                    href={isLoading || isGoogleLoading ? "#" : "/signup"}
                    onClick={(e) => {
                      if (isLoading || isGoogleLoading) e.preventDefault();
                    }}
                    className={`text-sky-600 hover:text-sky-500 font-semibold transition underline-offset-4 hover:underline ${
                      isLoading || isGoogleLoading ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}