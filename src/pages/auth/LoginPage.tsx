import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useLogin } from "../../hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleSwitchToRegister = () => {
    reset();
    login.reset();
  };

  const onSubmit = (data: LoginFormData) => {
    login.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Minimal top bar */}
      <div className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-red-500 flex items-center justify-center">
            <svg
              className="h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="font-semibold text-gray-900 text-sm">CV Scan</span>
        </Link>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
            <div className="mb-7">
              <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
              <p className="text-sm text-gray-500 mt-1">
                Enter your credentials to access your account
              </p>
            </div>

            {login.error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg">
                <p className="text-sm text-red-600">
                  {(
                    login.error as {
                      response?: { data?: { message?: string } };
                    }
                  )?.response?.data?.message || "Incorrect email or password."}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <Button
                type="submit"
                className="w-full mt-1"
                loading={login.isPending}
              >
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link
                to="/register"
                onClick={handleSwitchToRegister}
                className="text-gray-700 hover:text-red-500 font-medium transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
