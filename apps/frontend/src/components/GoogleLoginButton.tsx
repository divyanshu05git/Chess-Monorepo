
import { GoogleLogin } from "@react-oauth/google";

const API_URL = import.meta.env.VITE_API_URL;

export default function GoogleLoginButton() {
  return (
    <GoogleLogin
      onSuccess={async (response) => {
        const credential = response.credential;

        if (!credential) {
          console.error("Google did not return an ID token");
          return;
        }

        try {
          const res = await fetch(`${API_URL}/auth/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ credential }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Login failed");
          }

          // This is your application's JWT, issued by your backend.
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          console.log("Login successful", data.user);
          window.location.href = "/game";
        } catch (error) {
          console.error("Login failed:", error);
        }
      }}
      onError={() => {
        console.error("Google sign-in failed");
      }}
    />
  );
}
