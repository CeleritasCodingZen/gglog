"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthContext";
import { apiPost } from "@/lib/api";
import { ApiError, type AuthData } from "@/lib/types";
import "./auth.css";

/* ============================================
   Types
   ============================================ */

type AuthMode = "signin" | "signup" | "forgot";
type AuthStatus = "idle" | "loading" | "success" | "error";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/* ============================================
   Redirect safety
   ============================================ */

/**
 * Validate that a redirect target is a safe internal path.
 * Prevents open redirects (e.g. ?next=https://evil.com).
 */
function isSafeRedirectPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  try {
    const url = new URL(path, "http://localhost");
    if (url.origin !== "http://localhost") return false;
  } catch {
    return false;
  }
  return true;
}

/* ============================================
   Animation config
   ============================================ */

const FORM_ANIM = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const FORM_TRANSITION = { duration: 0.22, ease: "easeOut" as const };

/* ============================================
   Component
   ============================================ */

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, setUser } = useAuth();

  // Where to redirect after successful login
  const nextParam = searchParams.get("next");
  const redirectTo =
    nextParam && isSafeRedirectPath(nextParam) ? nextParam : "/dashboard";

  /* ---- State ---- */
  const [mode, setMode] = useState<AuthMode>("signin");
  const [authStatus, setAuthStatus] = useState<AuthStatus>("idle");
  const [statusMsg, setStatusMsg] = useState({ title: "", sub: "" });

  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>(
    {}
  );

  /* ---- Redirect if already authenticated ---- */
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTo);
    }
  }, [loading, user, router, redirectTo]);

  /* ---- Handlers ---- */

  const handleChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const togglePassword = useCallback((field: string) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const switchMode = useCallback((newMode: AuthMode) => {
    setMode(newMode);
    setFormData({ username: "", email: "", password: "", confirmPassword: "" });
    setTouched({});
    setShowPasswords({});
    setAuthStatus("idle");
    setStatusMsg({ title: "", sub: "" });
  }, []);

  /* ---- Validation (sign-up only) ---- */

  const getValidation = useCallback(
    (field: string): { valid: boolean; message: string } | null => {
      if (!touched[field]) return null;
      const value = formData[field as keyof FormData];
      if (!value) return { valid: false, message: "REQUIRED_" };

      switch (field) {
        case "username":
          if (value.length < 3)
            return { valid: false, message: "MIN 3 CHARACTERS_" };
          if (!/^[a-zA-Z0-9_]+$/.test(value))
            return { valid: false, message: "INVALID CHARACTERS_" };
          return { valid: true, message: "USERNAME AVAILABLE_" };

        case "email":
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
            return { valid: false, message: "INVALID FORMAT_" };
          return { valid: true, message: "EMAIL VALID_" };

        case "password":
          if (value.length < 8)
            return { valid: false, message: "TOO SHORT_ (MIN 8)" };
          if (value.length >= 12)
            return { valid: true, message: "PASSWORD STRONG_" };
          return { valid: true, message: "PASSWORD ACCEPTED_" };

        case "confirmPassword":
          if (value !== formData.password)
            return { valid: false, message: "MISMATCH_" };
          return { valid: true, message: "MATCH CONFIRMED_" };

        default:
          return null;
      }
    },
    [touched, formData]
  );

  /* ---- Submit ---- */

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (authStatus === "loading") return;

      /* Sign-up: validate all fields */
      if (mode === "signup") {
        const fields: (keyof FormData)[] = [
          "username",
          "email",
          "password",
          "confirmPassword",
        ];
        const allTouched = fields.reduce(
          (acc, f) => ({ ...acc, [f]: true }),
          {}
        );
        setTouched(allTouched);

        const hasErrors = fields.some((f) => {
          const val = formData[f];
          if (!val) return true;
          const v = getValidation(f);
          return v && !v.valid;
        });
        /* Re-validate after touching since getValidation uses stale touched */
        if (hasErrors) return;
      }

      /* Sign-in: basic check */
      if (mode === "signin" && (!formData.username || !formData.password)) {
        setTouched({ username: true, password: true });
        return;
      }

      /* Forgot: basic check */
      if (mode === "forgot" && !formData.email) {
        setTouched({ email: true });
        return;
      }

      setAuthStatus("loading");

      /* ── Forgot password (no backend route — stays simulated) ── */
      if (mode === "forgot") {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAuthStatus("success");
        setStatusMsg({
          title: "RECOVERY LINK TRANSMITTED_",
          sub: "CHECK YOUR INBOX_",
        });
        setTimeout(() => switchMode("signin"), 3500);
        return;
      }

      /* ── Real API calls ── */
      try {
        let data: AuthData;

        if (mode === "signup") {
          data = await apiPost<AuthData>("/api/auth/signup", {
            username: formData.username,
            email: formData.email,
            password: formData.password,
          });
        } else {
          data = await apiPost<AuthData>("/api/auth/signin", {
            usernameOrEmail: formData.username,
            password: formData.password,
          });
        }

        /* Update auth context immediately */
        setUser(data.user);

        /* Show existing success animation */
        setAuthStatus("success");
        setStatusMsg({
          title: "ACCESS GRANTED_",
          sub: "PLAYER IDENTIFIED_",
        });

        /* Redirect to intended page after animation */
        setTimeout(() => {
          router.push(redirectTo);
        }, 2000);
      } catch (err) {
        /* ── Error handling ── */
        let title = "SYSTEM ERROR_";
        let sub = "TRY AGAIN LATER_";

        if (err instanceof ApiError) {
          switch (err.status) {
            case 0:
              title = "CONNECTION FAILED_";
              sub = "CHECK YOUR NETWORK_";
              break;
            case 401:
              title = "AUTH FAILURE_";
              sub = "CHECK CREDENTIALS_";
              break;
            case 409: {
              title = "ACCOUNT EXISTS_";
              const msg = err.message.toLowerCase();
              if (msg.includes("username")) {
                sub = "USERNAME ALREADY EXISTS_";
              } else if (msg.includes("email")) {
                sub = "EMAIL ALREADY EXISTS_";
              } else {
                sub = "ACCOUNT ALREADY EXISTS_";
              }
              break;
            }
            case 400:
              title = "VALIDATION ERROR_";
              sub = err.message.toUpperCase().replace(/\.$/, "") + "_";
              break;
            default:
              if (err.status >= 500) {
                title = "SYSTEM ERROR_";
                sub = "TRY AGAIN LATER_";
              } else {
                title = "AUTH FAILURE_";
                sub = err.message.toUpperCase().replace(/\.$/, "") + "_";
              }
          }
        }

        setAuthStatus("error");
        setStatusMsg({ title, sub });
        setTimeout(() => {
          setAuthStatus("idle");
          setStatusMsg({ title: "", sub: "" });
        }, 3000);
      }
    },
    [authStatus, mode, formData, getValidation, switchMode, router, setUser]
  );

  const handleGoogleAuth = useCallback(async () => {
    if (authStatus === "loading") return;
    setAuthStatus("loading");
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setAuthStatus("success");
    setStatusMsg({
      title: "ACCESS GRANTED_",
      sub: "GOOGLE PLAYER IDENTIFIED_",
    });
    setTimeout(() => {
      setAuthStatus("idle");
      setStatusMsg({ title: "", sub: "" });
    }, 3000);
  }, [authStatus]);

  /* ---- Button text ---- */

  const getButtonText = () => {
    if (authStatus === "loading") {
      return mode === "forgot"
        ? "[ TRANSMITTING... ]"
        : "[ AUTHENTICATING... ]";
    }
    switch (mode) {
      case "signin":
        return "[ SIGN IN_ ]";
      case "signup":
        return "[ CREATE ACCOUNT_ ]";
      case "forgot":
        return "[ TRANSMIT RECOVERY_ ]";
    }
  };

  /* ---- Field renderer ---- */

  const renderField = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    opts?: {
      type?: string;
      isPassword?: boolean;
      autoComplete?: string;
    }
  ) => {
    const { type = "text", isPassword = false, autoComplete } = opts || {};
    const validation = mode === "signup" ? getValidation(field) : null;
    const inputType = isPassword
      ? showPasswords[field]
        ? "text"
        : "password"
      : type;
    const hasError = validation && !validation.valid;

    return (
      <div className="mb-5">
        <label className="block font-space text-[11px] text-text-dim tracking-[0.15em] uppercase mb-2.5">
          {label}
        </label>
        <div className={isPassword ? "auth-pw-wrap" : undefined}>
          <input
            type={inputType}
            value={formData[field]}
            onChange={(e) => handleChange(field, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={placeholder}
            className={`auth-input${hasError ? " has-error" : ""}`}
            disabled={authStatus === "loading"}
            autoComplete={autoComplete}
            aria-label={label.replace("_", "")}
          />
          {isPassword && formData[field] && (
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => togglePassword(field)}
              aria-label={
                showPasswords[field] ? "Hide password" : "Show password"
              }
              tabIndex={-1}
            >
              {showPasswords[field] ? "HIDE" : "SHOW"}
            </button>
          )}
        </div>
        {validation && (
          <p
            className={`auth-valid ${validation.valid ? "auth-valid-ok" : "auth-valid-err"
              }`}
          >
            {validation.message}
          </p>
        )}
      </div>
    );
  };

  /* ---- Determine content key for AnimatePresence ---- */
  const contentKey =
    authStatus === "success"
      ? "status-success"
      : authStatus === "error"
        ? "status-error"
        : `form-${mode}`;

  /* ============================================
     Render
     ============================================ */

  return (
    <div className="min-h-screen flex flex-col relative bg-bg overflow-hidden">
      {/* ===== LOGO — upper-left ===== */}
      <header className="pt-7 px-6 lg:absolute lg:top-10 lg:left-10 lg:p-0 z-10 auth-boot-5">
        <h1 className="font-pixel text-lime text-[14px] leading-none tracking-wide glow-lime">
          GGLOG
        </h1>
        <p className="font-space text-text-muted text-[10px] tracking-[0.2em] mt-2 uppercase">
          GGLOG // ARCHIVE SYSTEM
        </p>
      </header>

      {/* ===== MAIN — panel container ===== */}
      <main className="flex-1 flex items-center justify-center px-5 py-10 md:py-14 lg:py-0 lg:justify-end lg:pr-[12%] xl:pr-[16%]">
        {/* Auth Panel */}
        <div
          className={`
            w-full max-w-[420px] bg-[#0c0c0c] border border-[#1a1a1a] relative
            ${authStatus === "success" ? "auth-panel-success" : ""}
            ${authStatus === "error" ? "auth-panel-error" : ""}
          `}
        >
          {/* Anti-design: extending line */}
          <div
            className="hidden lg:block absolute -left-16 top-16 w-16 h-px bg-[#1a1a1a]"
            aria-hidden="true"
          />

          {/* Anti-design: coordinate text */}
          <div
            className="hidden lg:block absolute -top-5 right-1 font-mono text-[9px] text-text-muted/20 tracking-[0.2em] select-none"
            aria-hidden="true"
          >
            AUTH_0x7F2::NODE
          </div>

          {/* ── Panel Header ── */}
          <div className="flex items-center justify-between px-7 pt-7 pb-5">
            <span className="font-space text-[11px] text-text-muted tracking-[0.12em] uppercase auth-boot-1">
              SYS://GGLOG/AUTH
            </span>
            <span className="font-space text-[11px] text-lime tracking-[0.08em] auth-boot-2 flex items-center gap-1.5">
              <span>■</span>
              <span>
                SYSTEM READY
                <span className="auth-cursor-blink">_</span>
              </span>
            </span>
          </div>

          {/* ── Divider ── */}
          <div className="h-px bg-[#1a1a1a] auth-boot-3" />

          {/* ── Content Area ── */}
          <div className="px-7 pt-7 pb-8 auth-boot-4">
            <AnimatePresence mode="wait">
              {/* ──────── SUCCESS STATE ──────── */}
              {authStatus === "success" ? (
                <motion.div
                  key="status-success"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="auth-status"
                >
                  <div className="auth-status-icon text-lime">◆</div>
                  <p className="font-pixel text-lime text-[11px] tracking-wide glow-lime">
                    {statusMsg.title}
                  </p>
                  <p className="font-space text-text-dim text-xs tracking-wider mt-1">
                    {statusMsg.sub}
                  </p>
                </motion.div>
              ) : authStatus === "error" ? (
                /* ──────── ERROR STATE ──────── */
                <motion.div
                  key="status-error"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="auth-status"
                >
                  <div className="auth-status-icon text-warning">✕</div>
                  <p className="font-pixel text-warning text-[11px] tracking-wide">
                    {statusMsg.title}
                  </p>
                  <p className="font-space text-text-dim text-xs tracking-wider mt-1">
                    {statusMsg.sub}
                  </p>
                </motion.div>
              ) : (
                /* ──────── FORM ──────── */
                <motion.div
                  key={`form-${mode}`}
                  {...FORM_ANIM}
                  transition={FORM_TRANSITION}
                >
                  {/* Title section */}
                  {mode === "signup" && (
                    <p className="font-space text-[10px] text-text-muted tracking-[0.18em] uppercase mb-1.5">
                      /// NEW PLAYER
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-pixel text-text text-[11px] leading-relaxed tracking-wide">
                      {mode === "signin" && "IDENTIFY PLAYER_"}
                      {mode === "signup" && "CREATE ACCOUNT_"}
                      {mode === "forgot" && "RECOVERY PROTOCOL_"}
                    </h2>
                    <span className="blink-block" aria-hidden="true" />
                  </div>

                  <p className="font-space text-text-dim text-xs tracking-wider mb-7">
                    {mode === "signin" && "Continue your gaming archive."}
                    {mode === "signup" && "Start your gaming archive."}
                    {mode === "forgot" && "Enter your registered identifier."}
                  </p>

                  {/* Form */}
                  <form onSubmit={handleSubmit} noValidate>
                    {/* ── SIGN IN fields ── */}
                    {mode === "signin" && (
                      <>
                        {renderField("username", "USERNAME_", "ENTER IDENTIFIER", {
                          autoComplete: "username",
                        })}
                        {renderField("password", "PASSWORD_", "••••••••", {
                          isPassword: true,
                          autoComplete: "current-password",
                        })}
                        <button
                          type="button"
                          className="auth-forgot mb-6 -mt-2"
                          onClick={() => switchMode("forgot")}
                        >
                          FORGOT ACCESS?_
                        </button>
                      </>
                    )}

                    {/* ── SIGN UP fields ── */}
                    {mode === "signup" && (
                      <>
                        {renderField("username", "USERNAME_", "CHOOSE IDENTIFIER", {
                          autoComplete: "username",
                        })}
                        {renderField("email", "EMAIL_", "PLAYER@DOMAIN.COM", {
                          type: "email",
                          autoComplete: "email",
                        })}
                        {renderField("password", "PASSWORD_", "MIN 8 CHARACTERS", {
                          isPassword: true,
                          autoComplete: "new-password",
                        })}
                        {renderField(
                          "confirmPassword",
                          "CONFIRM PASSWORD_",
                          "RE-ENTER PASSWORD",
                          { isPassword: true, autoComplete: "new-password" }
                        )}
                      </>
                    )}

                    {/* ── FORGOT fields ── */}
                    {mode === "forgot" && (
                      <>
                        {renderField("email", "EMAIL_", "REGISTERED EMAIL", {
                          type: "email",
                          autoComplete: "email",
                        })}
                      </>
                    )}

                    {/* Primary button */}
                    <button
                      type="submit"
                      className={`auth-btn-primary mt-2 ${authStatus === "loading" ? "is-loading" : ""
                        }`}
                      disabled={authStatus === "loading"}
                    >
                      <span className="auth-btn-text">{getButtonText()}</span>
                    </button>
                  </form>

                  {/* ── OR + Google (not for forgot) ── */}
                  {mode !== "forgot" && (
                    <>
                      <div className="auth-or my-5">
                        <div className="auth-or-line" />
                        <span className="auth-or-text">OR</span>
                        <div className="auth-or-line" />
                      </div>

                      <button
                        type="button"
                        className="auth-btn-secondary"
                        onClick={handleGoogleAuth}
                        disabled={authStatus === "loading"}
                      >
                        {">"} [ G ] CONTINUE WITH GOOGLE
                      </button>
                    </>
                  )}

                  {/* ── Mode switch ── */}
                  <div className="mt-6 text-center">
                    {mode === "signin" && (
                      <button
                        type="button"
                        className="auth-switch"
                        onClick={() => switchMode("signup")}
                      >
                        NEW PLAYER?{" "}
                        <span className="auth-switch-accent">
                          CREATE ACCOUNT_ →
                        </span>
                      </button>
                    )}
                    {mode === "signup" && (
                      <button
                        type="button"
                        className="auth-switch"
                        onClick={() => switchMode("signin")}
                      >
                        ALREADY A PLAYER?{" "}
                        <span className="auth-switch-accent">
                          SIGN IN_ →
                        </span>
                      </button>
                    )}
                    {mode === "forgot" && (
                      <button
                        type="button"
                        className="auth-switch"
                        onClick={() => switchMode("signin")}
                      >
                        <span className="auth-switch-accent">←</span> BACK TO
                        AUTH_
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ===== FOOTER — bottom-left ===== */}
      <footer className="pb-7 px-6 text-center lg:absolute lg:bottom-10 lg:left-10 lg:text-left lg:p-0 z-10 auth-boot-5">
        <p className="font-space text-text-muted/60 text-[10px] tracking-[0.15em] uppercase select-none">
          [ SYSTEM READY ] © 2026 GGLOG_ARCHIVE
        </p>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <span className="font-mono text-[11px] text-lime tracking-wider cursor-blink glow-lime">
          INITIALIZING SECURE TERMINAL
        </span>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}
