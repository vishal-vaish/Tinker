"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomInput from "@/components/global/CustomInput";
import { signUpSchema, type SignUpFormValues } from "@/lib/schemas";
import { registerEndpoint, oauthLoginEndpoint } from "@/action";

interface SignUpFormProps {
  onSwitchToSignIn?: () => void;
  /** Backwards compatibility alias */
  onToggleMode?: () => void;
}

export function SignUpForm({ onSwitchToSignIn, onToggleMode }: SignUpFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitch = onSwitchToSignIn || onToggleMode;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const response = await registerEndpoint(data);
      if (response.success) {
        router.push("/workspace");
      }
    } catch (err) {
      console.error("Registration failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      const response = await oauthLoginEndpoint(provider);
      if (response.success) {
        router.push("/workspace");
      }
    } catch (err) {
      console.error("OAuth login failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* OAuth Providers */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => handleOAuthLogin("github")}
          disabled={isLoading}
          type="button"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>GitHub</span>
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="w-full"
          onClick={() => handleOAuthLogin("google")}
          disabled={isLoading}
          type="button"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </Button>
      </div>

      {/* Separator */}
      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-border" />
        <span className="flex-shrink mx-3 text-xs text-muted-foreground font-medium">
          Or sign up with email
        </span>
        <div className="flex-grow border-t border-border" />
      </div>

      {/* Credentials Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <CustomInput
            name="firstName"
            control={control}
            label="First Name"
            placeholder="Jane"
            autoComplete="given-name"
          />

          <CustomInput
            name="lastName"
            control={control}
            label="Last Name"
            placeholder="Doe"
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <CustomInput
          name="email"
          control={control}
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          icon={Mail}
        />

        {/* Password */}
        <CustomInput
          name="password"
          control={control}
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={Lock}
        />

        {/* Confirm Password */}
        <CustomInput
          name="confirmPassword"
          control={control}
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          icon={Lock}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full mt-2"
          disabled={isLoading}
        >
          <span>{isLoading ? "Authenticating..." : "Create Account"}</span>
          <ArrowRight />
        </Button>
      </form>

      {/* Switch between Sign In and Sign Up */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        <p>
          Already have an account?{" "}
          <button
            type="button"
            onClick={handleSwitch}
            className="text-primary hover:underline font-semibold cursor-pointer transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default SignUpForm;
