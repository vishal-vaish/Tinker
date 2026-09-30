import type {
  AuthResponse,
  UserSession,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  OAuthLoginResponse,
  LogoutResponse,
} from "@/lib/types";

export type {
  AuthResponse,
  UserSession,
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  OAuthLoginResponse,
  LogoutResponse,
};

/**
 * Handles user authentication via email & password.
 */
export async function loginEndpoint(
  data: LoginRequest
): Promise<AuthResponse<UserSession>> {
  // Simulate network latency or forward to actual backend API endpoint
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!data.email || !data.password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  return {
    success: true,
    message: "Logged in successfully.",
    data: {
      id: "usr_mock_12345",
      email: data.email,
      name: data.email.split("@")[0],
      role: "admin",
      plan: "pro",
      tokensAvailable: 85400,
      createdAt: "2026-09-01T00:00:00.000Z",
      token: "jwt_mock_token_tinker_production",
    },
  };
}

/**
 * Backwards compatibility alias for typo tolerance
 */
export const loginEndpoind = loginEndpoint;

/**
 * Handles new user account registration.
 */
export async function registerEndpoint(
  data: RegisterRequest
): Promise<AuthResponse<UserSession>> {
  // Simulate network latency or forward to actual backend API endpoint
  await new Promise((resolve) => setTimeout(resolve, 600));

  if (!data.email || !data.password) {
    return {
      success: false,
      error: "All required fields must be provided.",
    };
  }

  return {
    success: true,
    message: "Account created successfully.",
    data: {
      id: "usr_mock_67890",
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`.trim(),
      role: "user",
      plan: "free",
      tokensAvailable: 100000,
      createdAt: new Date().toISOString(),
      token: "jwt_mock_token_tinker_production",
    },
  };
}

/**
 * Handles OAuth authentication flow (GitHub, Google, etc.)
 */
export async function oauthLoginEndpoint(
  provider: "github" | "google" | string
): Promise<OAuthLoginResponse> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    success: true,
    message: `Redirecting to ${provider} authentication...`,
    data: {
      redirectUrl: `/api/auth/${provider}`,
    },
  };
}

/**
 * Handles password reset initiation.
 */
export async function forgotPasswordEndpoint(
  data: ForgotPasswordRequest
): Promise<AuthResponse<null>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: `Password reset instructions sent to ${data.email}.`,
  };
}

/**
 * Handles user sign out.
 */
export async function logoutEndpoint(): Promise<LogoutResponse> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    message: "Signed out successfully.",
  };
}
