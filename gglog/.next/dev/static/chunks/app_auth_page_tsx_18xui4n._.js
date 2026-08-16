(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/auth/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AuthPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/providers/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/api.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/types.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
/* ============================================
   Redirect safety
   ============================================ */ /**
 * Validate that a redirect target is a safe internal path.
 * Prevents open redirects (e.g. ?next=https://evil.com).
 */ function isSafeRedirectPath(path) {
    if (!path.startsWith("/")) return false;
    if (path.startsWith("//")) return false;
    if (path.includes("\\")) return false;
    try {
        const url = new URL(path, "http://localhost");
        if (url.origin !== "http://localhost") return false;
    } catch  {
        return false;
    }
    return true;
}
/* ============================================
   Animation config
   ============================================ */ const FORM_ANIM = {
    initial: {
        opacity: 0,
        y: 10
    },
    animate: {
        opacity: 1,
        y: 0
    },
    exit: {
        opacity: 0,
        y: -10
    }
};
const FORM_TRANSITION = {
    duration: 0.22,
    ease: "easeOut"
};
/* ============================================
   Component
   ============================================ */ function AuthPageContent() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const { user, loading, setUser } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    // Where to redirect after successful login
    const nextParam = searchParams.get("next");
    const redirectTo = nextParam && isSafeRedirectPath(nextParam) ? nextParam : "/dashboard";
    /* ---- State ---- */ const [mode, setMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("signin");
    const [authStatus, setAuthStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("idle");
    const [statusMsg, setStatusMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        title: "",
        sub: ""
    });
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        username: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [touched, setTouched] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [showPasswords, setShowPasswords] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    /* ---- Redirect if already authenticated ---- */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthPageContent.useEffect": ()=>{
            if (!loading && user) {
                router.replace(redirectTo);
            }
        }
    }["AuthPageContent.useEffect"], [
        loading,
        user,
        router,
        redirectTo
    ]);
    /* ---- Handlers ---- */ const handleChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[handleChange]": (field, value)=>{
            setFormData({
                "AuthPageContent.useCallback[handleChange]": (prev)=>({
                        ...prev,
                        [field]: value
                    })
            }["AuthPageContent.useCallback[handleChange]"]);
        }
    }["AuthPageContent.useCallback[handleChange]"], []);
    const handleBlur = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[handleBlur]": (field)=>{
            setTouched({
                "AuthPageContent.useCallback[handleBlur]": (prev)=>({
                        ...prev,
                        [field]: true
                    })
            }["AuthPageContent.useCallback[handleBlur]"]);
        }
    }["AuthPageContent.useCallback[handleBlur]"], []);
    const togglePassword = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[togglePassword]": (field)=>{
            setShowPasswords({
                "AuthPageContent.useCallback[togglePassword]": (prev)=>({
                        ...prev,
                        [field]: !prev[field]
                    })
            }["AuthPageContent.useCallback[togglePassword]"]);
        }
    }["AuthPageContent.useCallback[togglePassword]"], []);
    const switchMode = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[switchMode]": (newMode)=>{
            setMode(newMode);
            setFormData({
                username: "",
                email: "",
                password: "",
                confirmPassword: ""
            });
            setTouched({});
            setShowPasswords({});
            setAuthStatus("idle");
            setStatusMsg({
                title: "",
                sub: ""
            });
        }
    }["AuthPageContent.useCallback[switchMode]"], []);
    /* ---- Validation (sign-up only) ---- */ const getValidation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[getValidation]": (field)=>{
            if (!touched[field]) return null;
            const value = formData[field];
            if (!value) return {
                valid: false,
                message: "REQUIRED_"
            };
            switch(field){
                case "username":
                    if (value.length < 3) return {
                        valid: false,
                        message: "MIN 3 CHARACTERS_"
                    };
                    if (!/^[a-zA-Z0-9_]+$/.test(value)) return {
                        valid: false,
                        message: "INVALID CHARACTERS_"
                    };
                    return {
                        valid: true,
                        message: "USERNAME AVAILABLE_"
                    };
                case "email":
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return {
                        valid: false,
                        message: "INVALID FORMAT_"
                    };
                    return {
                        valid: true,
                        message: "EMAIL VALID_"
                    };
                case "password":
                    if (value.length < 8) return {
                        valid: false,
                        message: "TOO SHORT_ (MIN 8)"
                    };
                    if (value.length >= 12) return {
                        valid: true,
                        message: "PASSWORD STRONG_"
                    };
                    return {
                        valid: true,
                        message: "PASSWORD ACCEPTED_"
                    };
                case "confirmPassword":
                    if (value !== formData.password) return {
                        valid: false,
                        message: "MISMATCH_"
                    };
                    return {
                        valid: true,
                        message: "MATCH CONFIRMED_"
                    };
                default:
                    return null;
            }
        }
    }["AuthPageContent.useCallback[getValidation]"], [
        touched,
        formData
    ]);
    /* ---- Submit ---- */ const handleSubmit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[handleSubmit]": async (e)=>{
            e.preventDefault();
            if (authStatus === "loading") return;
            /* Sign-up: validate all fields */ if (mode === "signup") {
                const fields = [
                    "username",
                    "email",
                    "password",
                    "confirmPassword"
                ];
                const allTouched = fields.reduce({
                    "AuthPageContent.useCallback[handleSubmit].allTouched": (acc, f)=>({
                            ...acc,
                            [f]: true
                        })
                }["AuthPageContent.useCallback[handleSubmit].allTouched"], {});
                setTouched(allTouched);
                const hasErrors = fields.some({
                    "AuthPageContent.useCallback[handleSubmit].hasErrors": (f)=>{
                        const val = formData[f];
                        if (!val) return true;
                        const v = getValidation(f);
                        return v && !v.valid;
                    }
                }["AuthPageContent.useCallback[handleSubmit].hasErrors"]);
                /* Re-validate after touching since getValidation uses stale touched */ if (hasErrors) return;
            }
            /* Sign-in: basic check */ if (mode === "signin" && (!formData.username || !formData.password)) {
                setTouched({
                    username: true,
                    password: true
                });
                return;
            }
            /* Forgot: basic check */ if (mode === "forgot" && !formData.email) {
                setTouched({
                    email: true
                });
                return;
            }
            setAuthStatus("loading");
            /* ── Forgot password (no backend route — stays simulated) ── */ if (mode === "forgot") {
                await new Promise({
                    "AuthPageContent.useCallback[handleSubmit]": (resolve)=>setTimeout(resolve, 1500)
                }["AuthPageContent.useCallback[handleSubmit]"]);
                setAuthStatus("success");
                setStatusMsg({
                    title: "RECOVERY LINK TRANSMITTED_",
                    sub: "CHECK YOUR INBOX_"
                });
                setTimeout({
                    "AuthPageContent.useCallback[handleSubmit]": ()=>switchMode("signin")
                }["AuthPageContent.useCallback[handleSubmit]"], 3500);
                return;
            }
            /* ── Real API calls ── */ try {
                let data;
                if (mode === "signup") {
                    data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPost"])("/api/auth/signup", {
                        username: formData.username,
                        email: formData.email,
                        password: formData.password
                    });
                } else {
                    data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["apiPost"])("/api/auth/signin", {
                        usernameOrEmail: formData.username,
                        password: formData.password
                    });
                }
                /* Update auth context immediately */ setUser(data.user);
                /* Show existing success animation */ setAuthStatus("success");
                setStatusMsg({
                    title: "ACCESS GRANTED_",
                    sub: "PLAYER IDENTIFIED_"
                });
                /* Redirect to intended page after animation */ setTimeout({
                    "AuthPageContent.useCallback[handleSubmit]": ()=>{
                        router.push(redirectTo);
                    }
                }["AuthPageContent.useCallback[handleSubmit]"], 2000);
            } catch (err) {
                /* ── Error handling ── */ let title = "SYSTEM ERROR_";
                let sub = "TRY AGAIN LATER_";
                if (err instanceof __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ApiError"]) {
                    switch(err.status){
                        case 0:
                            title = "CONNECTION FAILED_";
                            sub = "CHECK YOUR NETWORK_";
                            break;
                        case 401:
                            title = "AUTH FAILURE_";
                            sub = "CHECK CREDENTIALS_";
                            break;
                        case 409:
                            {
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
                setStatusMsg({
                    title,
                    sub
                });
                setTimeout({
                    "AuthPageContent.useCallback[handleSubmit]": ()=>{
                        setAuthStatus("idle");
                        setStatusMsg({
                            title: "",
                            sub: ""
                        });
                    }
                }["AuthPageContent.useCallback[handleSubmit]"], 3000);
            }
        }
    }["AuthPageContent.useCallback[handleSubmit]"], [
        authStatus,
        mode,
        formData,
        getValidation,
        switchMode,
        router,
        setUser
    ]);
    const handleGoogleAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "AuthPageContent.useCallback[handleGoogleAuth]": async ()=>{
            if (authStatus === "loading") return;
            setAuthStatus("loading");
            await new Promise({
                "AuthPageContent.useCallback[handleGoogleAuth]": (resolve)=>setTimeout(resolve, 1800)
            }["AuthPageContent.useCallback[handleGoogleAuth]"]);
            setAuthStatus("success");
            setStatusMsg({
                title: "ACCESS GRANTED_",
                sub: "GOOGLE PLAYER IDENTIFIED_"
            });
            setTimeout({
                "AuthPageContent.useCallback[handleGoogleAuth]": ()=>{
                    setAuthStatus("idle");
                    setStatusMsg({
                        title: "",
                        sub: ""
                    });
                }
            }["AuthPageContent.useCallback[handleGoogleAuth]"], 3000);
        }
    }["AuthPageContent.useCallback[handleGoogleAuth]"], [
        authStatus
    ]);
    /* ---- Button text ---- */ const getButtonText = ()=>{
        if (authStatus === "loading") {
            return mode === "forgot" ? "[ TRANSMITTING... ]" : "[ AUTHENTICATING... ]";
        }
        switch(mode){
            case "signin":
                return "[ SIGN IN_ ]";
            case "signup":
                return "[ CREATE ACCOUNT_ ]";
            case "forgot":
                return "[ TRANSMIT RECOVERY_ ]";
        }
    };
    /* ---- Field renderer ---- */ const renderField = (field, label, placeholder, opts)=>{
        const { type = "text", isPassword = false, autoComplete } = opts || {};
        const validation = mode === "signup" ? getValidation(field) : null;
        const inputType = isPassword ? showPasswords[field] ? "text" : "password" : type;
        const hasError = validation && !validation.valid;
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "block font-space text-[11px] text-text-dim tracking-[0.15em] uppercase mb-2.5",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/app/auth/page.tsx",
                    lineNumber: 359,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: isPassword ? "auth-pw-wrap" : undefined,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: inputType,
                            value: formData[field],
                            onChange: (e)=>handleChange(field, e.target.value),
                            onBlur: ()=>handleBlur(field),
                            placeholder: placeholder,
                            className: `auth-input${hasError ? " has-error" : ""}`,
                            disabled: authStatus === "loading",
                            autoComplete: autoComplete,
                            "aria-label": label.replace("_", "")
                        }, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 363,
                            columnNumber: 11
                        }, this),
                        isPassword && formData[field] && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "auth-pw-toggle",
                            onClick: ()=>togglePassword(field),
                            "aria-label": showPasswords[field] ? "Hide password" : "Show password",
                            tabIndex: -1,
                            children: showPasswords[field] ? "HIDE" : "SHOW"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 375,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/auth/page.tsx",
                    lineNumber: 362,
                    columnNumber: 9
                }, this),
                validation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: `auth-valid ${validation.valid ? "auth-valid-ok" : "auth-valid-err"}`,
                    children: validation.message
                }, void 0, false, {
                    fileName: "[project]/app/auth/page.tsx",
                    lineNumber: 389,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/auth/page.tsx",
            lineNumber: 358,
            columnNumber: 7
        }, this);
    };
    /* ---- Determine content key for AnimatePresence ---- */ const contentKey = authStatus === "success" ? "status-success" : authStatus === "error" ? "status-error" : `form-${mode}`;
    /* ============================================
     Render
     ============================================ */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col relative bg-bg overflow-hidden",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "pt-7 px-6 lg:absolute lg:top-10 lg:left-10 lg:p-0 z-10 auth-boot-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "font-pixel text-lime text-[14px] leading-none tracking-wide glow-lime",
                        children: "GGLOG"
                    }, void 0, false, {
                        fileName: "[project]/app/auth/page.tsx",
                        lineNumber: 416,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-space text-text-muted text-[10px] tracking-[0.2em] mt-2 uppercase",
                        children: "GGLOG // ARCHIVE SYSTEM"
                    }, void 0, false, {
                        fileName: "[project]/app/auth/page.tsx",
                        lineNumber: 419,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/auth/page.tsx",
                lineNumber: 415,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                className: "flex-1 flex items-center justify-center px-5 py-10 md:py-14 lg:py-0 lg:justify-end lg:pr-[12%] xl:pr-[16%]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `
            w-full max-w-[420px] bg-[#0c0c0c] border border-[#1a1a1a] relative
            ${authStatus === "success" ? "auth-panel-success" : ""}
            ${authStatus === "error" ? "auth-panel-error" : ""}
          `,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden lg:block absolute -left-16 top-16 w-16 h-px bg-[#1a1a1a]",
                            "aria-hidden": "true"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 435,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden lg:block absolute -top-5 right-1 font-mono text-[9px] text-text-muted/20 tracking-[0.2em] select-none",
                            "aria-hidden": "true",
                            children: "AUTH_0x7F2::NODE"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 441,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-7 pt-7 pb-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-space text-[11px] text-text-muted tracking-[0.12em] uppercase auth-boot-1",
                                    children: "SYS://GGLOG/AUTH"
                                }, void 0, false, {
                                    fileName: "[project]/app/auth/page.tsx",
                                    lineNumber: 450,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-space text-[11px] text-lime tracking-[0.08em] auth-boot-2 flex items-center gap-1.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "■"
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 454,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "SYSTEM READY",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "auth-cursor-blink",
                                                    children: "_"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 457,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 455,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/auth/page.tsx",
                                    lineNumber: 453,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 449,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-px bg-[#1a1a1a] auth-boot-3"
                        }, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 463,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-7 pt-7 pb-8 auth-boot-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                mode: "wait",
                                children: authStatus === "success" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.97
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    exit: {
                                        opacity: 0,
                                        scale: 0.97
                                    },
                                    transition: {
                                        duration: 0.25
                                    },
                                    className: "auth-status",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "auth-status-icon text-lime",
                                            children: "◆"
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 478,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-pixel text-lime text-[11px] tracking-wide glow-lime",
                                            children: statusMsg.title
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 479,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-space text-text-dim text-xs tracking-wider mt-1",
                                            children: statusMsg.sub
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 482,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, "status-success", true, {
                                    fileName: "[project]/app/auth/page.tsx",
                                    lineNumber: 470,
                                    columnNumber: 17
                                }, this) : authStatus === "error" ? /* ──────── ERROR STATE ──────── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    initial: {
                                        opacity: 0,
                                        scale: 0.97
                                    },
                                    animate: {
                                        opacity: 1,
                                        scale: 1
                                    },
                                    exit: {
                                        opacity: 0,
                                        scale: 0.97
                                    },
                                    transition: {
                                        duration: 0.25
                                    },
                                    className: "auth-status",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "auth-status-icon text-warning",
                                            children: "✕"
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 496,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-pixel text-warning text-[11px] tracking-wide",
                                            children: statusMsg.title
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 497,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-space text-text-dim text-xs tracking-wider mt-1",
                                            children: statusMsg.sub
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 500,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, "status-error", true, {
                                    fileName: "[project]/app/auth/page.tsx",
                                    lineNumber: 488,
                                    columnNumber: 17
                                }, this) : /* ──────── FORM ──────── */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    ...FORM_ANIM,
                                    transition: FORM_TRANSITION,
                                    children: [
                                        mode === "signup" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-space text-[10px] text-text-muted tracking-[0.18em] uppercase mb-1.5",
                                            children: "/// NEW PLAYER"
                                        }, void 0, false, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 513,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between mb-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "font-pixel text-text text-[11px] leading-relaxed tracking-wide",
                                                    children: [
                                                        mode === "signin" && "IDENTIFY PLAYER_",
                                                        mode === "signup" && "CREATE ACCOUNT_",
                                                        mode === "forgot" && "RECOVERY PROTOCOL_"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 519,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "blink-block",
                                                    "aria-hidden": "true"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 524,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 518,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-space text-text-dim text-xs tracking-wider mb-7",
                                            children: [
                                                mode === "signin" && "Continue your gaming archive.",
                                                mode === "signup" && "Start your gaming archive.",
                                                mode === "forgot" && "Enter your registered identifier."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 527,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                            onSubmit: handleSubmit,
                                            noValidate: true,
                                            children: [
                                                mode === "signin" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        renderField("username", "USERNAME_", "ENTER IDENTIFIER", {
                                                            autoComplete: "username"
                                                        }),
                                                        renderField("password", "PASSWORD_", "••••••••", {
                                                            isPassword: true,
                                                            autoComplete: "current-password"
                                                        }),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: "auth-forgot mb-6 -mt-2",
                                                            onClick: ()=>switchMode("forgot"),
                                                            children: "FORGOT ACCESS?_"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 545,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 537,
                                                    columnNumber: 23
                                                }, this),
                                                mode === "signup" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: [
                                                        renderField("username", "USERNAME_", "CHOOSE IDENTIFIER", {
                                                            autoComplete: "username"
                                                        }),
                                                        renderField("email", "EMAIL_", "PLAYER@DOMAIN.COM", {
                                                            type: "email",
                                                            autoComplete: "email"
                                                        }),
                                                        renderField("password", "PASSWORD_", "MIN 8 CHARACTERS", {
                                                            isPassword: true,
                                                            autoComplete: "new-password"
                                                        }),
                                                        renderField("confirmPassword", "CONFIRM PASSWORD_", "RE-ENTER PASSWORD", {
                                                            isPassword: true,
                                                            autoComplete: "new-password"
                                                        })
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 557,
                                                    columnNumber: 23
                                                }, this),
                                                mode === "forgot" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                    children: renderField("email", "EMAIL_", "REGISTERED EMAIL", {
                                                        type: "email",
                                                        autoComplete: "email"
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 580,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    className: `auth-btn-primary mt-2 ${authStatus === "loading" ? "is-loading" : ""}`,
                                                    disabled: authStatus === "loading",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "auth-btn-text",
                                                        children: getButtonText()
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/auth/page.tsx",
                                                        lineNumber: 595,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 589,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 534,
                                            columnNumber: 19
                                        }, this),
                                        mode !== "forgot" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "auth-or my-5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "auth-or-line"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 603,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "auth-or-text",
                                                            children: "OR"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 604,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "auth-or-line"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 605,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 602,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "auth-btn-secondary",
                                                    onClick: handleGoogleAuth,
                                                    disabled: authStatus === "loading",
                                                    children: [
                                                        ">",
                                                        " [ G ] CONTINUE WITH GOOGLE"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 608,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 601,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "mt-6 text-center",
                                            children: [
                                                mode === "signin" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "auth-switch",
                                                    onClick: ()=>switchMode("signup"),
                                                    children: [
                                                        "NEW PLAYER?",
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "auth-switch-accent",
                                                            children: "CREATE ACCOUNT_ →"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 628,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 622,
                                                    columnNumber: 23
                                                }, this),
                                                mode === "signup" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "auth-switch",
                                                    onClick: ()=>switchMode("signin"),
                                                    children: [
                                                        "ALREADY A PLAYER?",
                                                        " ",
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "auth-switch-accent",
                                                            children: "SIGN IN_ →"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 640,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 634,
                                                    columnNumber: 23
                                                }, this),
                                                mode === "forgot" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "auth-switch",
                                                    onClick: ()=>switchMode("signin"),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "auth-switch-accent",
                                                            children: "←"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/auth/page.tsx",
                                                            lineNumber: 651,
                                                            columnNumber: 25
                                                        }, this),
                                                        " BACK TO AUTH_"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/auth/page.tsx",
                                                    lineNumber: 646,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/auth/page.tsx",
                                            lineNumber: 620,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, `form-${mode}`, true, {
                                    fileName: "[project]/app/auth/page.tsx",
                                    lineNumber: 506,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/auth/page.tsx",
                                lineNumber: 467,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/auth/page.tsx",
                            lineNumber: 466,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/auth/page.tsx",
                    lineNumber: 427,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/auth/page.tsx",
                lineNumber: 425,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "pb-7 px-6 text-center lg:absolute lg:bottom-10 lg:left-10 lg:text-left lg:p-0 z-10 auth-boot-5",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-space text-text-muted/60 text-[10px] tracking-[0.15em] uppercase select-none",
                    children: "[ SYSTEM READY ] © 2026 GGLOG_ARCHIVE"
                }, void 0, false, {
                    fileName: "[project]/app/auth/page.tsx",
                    lineNumber: 665,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/auth/page.tsx",
                lineNumber: 664,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/auth/page.tsx",
        lineNumber: 413,
        columnNumber: 5
    }, this);
}
_s(AuthPageContent, "cqIu8cH9ZaEqXBhnQRWZt1/ypwM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSearchParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$providers$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = AuthPageContent;
function AuthPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-bg flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-mono text-[11px] text-lime tracking-wider cursor-blink glow-lime",
                children: "INITIALIZING SECURE TERMINAL"
            }, void 0, false, {
                fileName: "[project]/app/auth/page.tsx",
                lineNumber: 677,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/auth/page.tsx",
            lineNumber: 676,
            columnNumber: 7
        }, this),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthPageContent, {}, void 0, false, {
            fileName: "[project]/app/auth/page.tsx",
            lineNumber: 682,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/auth/page.tsx",
        lineNumber: 675,
        columnNumber: 5
    }, this);
}
_c1 = AuthPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "AuthPageContent");
__turbopack_context__.k.register(_c1, "AuthPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_auth_page_tsx_18xui4n._.js.map