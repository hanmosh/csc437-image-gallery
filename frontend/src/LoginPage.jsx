import React from "react";
import { Link, useNavigate } from "react-router";
import "./LoginPage.css";
import { VALID_ROUTES } from "./shared/ValidRoutes.js";

export function LoginPage({ isRegistering = false, onLoginSuccess }) {
    const emailInputId = React.useId();
    const usernameInputId = React.useId();
    const passwordInputId = React.useId();
    const navigate = useNavigate();
    async function postJson(url, payload) {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        return response;
    }

    async function handleRegister(_previousError, formData) {
        const username = formData.get("username");
        const email = formData.get("email");
        const password = formData.get("password");

        try {
            const response = await postJson("/api/users", { username, email, password });
            if (response.ok) {
                const payload = await response.json();
                if (payload?.token) {
                    if (typeof onLoginSuccess === "function") {
                        onLoginSuccess(payload.token);
                    }
                    navigate(VALID_ROUTES.HOME);
                    return "";
                }
                return "Account creation failed: no token returned.";
            }

            if (response.status === 409) {
                return "That username is already taken. Please choose another.";
            }

            return `Account creation failed (HTTP ${response.status}). Please try again.`;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return `Account creation failed: ${message}`;
        }
    }

    async function handleLogin(_previousError, formData) {
        const username = formData.get("username");
        const password = formData.get("password");

        try {
            const response = await postJson("/api/auth/tokens", { username, password });
            if (response.ok) {
                const payload = await response.json();
                if (payload?.token) {
                    if (typeof onLoginSuccess === "function") {
                        onLoginSuccess(payload.token);
                    }
                    navigate(VALID_ROUTES.HOME);
                    return "";
                }
                return "Login failed: no token returned.";
            }

            if (response.status === 401) {
                return "Invalid username or password. Please try again.";
            }

            return `Login failed (HTTP ${response.status}). Please try again.`;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return `Login failed: ${message}`;
        }
    }

    const [registerError, registerAction, isRegisteringPending] =
        React.useActionState(handleRegister, "");
    const [loginError, loginAction, isLoginPending] = React.useActionState(handleLogin, "");
    const isFormDisabled = isRegistering ? isRegisteringPending : isLoginPending;
    const errorMessage = isRegistering ? registerError : loginError;
    const formAction = isRegistering ? registerAction : loginAction;

    return (
        <>
            <h2>{isRegistering ? "Register a new account" : "Login"}</h2>
            <form className="LoginPage-form" action={formAction}>
                {isRegistering ? (
                    <>
                        <label htmlFor={emailInputId}>Email</label>
                        <input
                            id={emailInputId}
                            name="email"
                            type="email"
                            required
                            disabled={isFormDisabled}
                        />
                    </>
                ) : null}

                <label htmlFor={usernameInputId}>Username</label>
                <input
                    id={usernameInputId}
                    name="username"
                    required
                    disabled={isFormDisabled}
                />

                <label htmlFor={passwordInputId}>Password</label>
                <input
                    id={passwordInputId}
                    name="password"
                    type="password"
                    required
                    disabled={isFormDisabled}
                />

                <input type="submit" value="Submit" disabled={isFormDisabled} />
            </form>
            <div aria-live="polite">
                {errorMessage !== "" && <p>{errorMessage}</p>}
            </div>
            {isRegistering ? (
                <p>
                    Already have an account?{" "}
                    <Link to={VALID_ROUTES.LOGIN}>Login here</Link>
                </p>
            ) : (
                <p>
                    Don't have an account?{" "}
                    <Link to={VALID_ROUTES.REGISTER}>Register here</Link>
                </p>
            )}
        </>
    );
}
