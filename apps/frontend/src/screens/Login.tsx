import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { isSignedIn } from "../auth";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/game";

  useEffect(() => {
    if (isSignedIn()) navigate(from, { replace: true });
  }, [from, navigate]);

  return (
    <main className="min-h-screen bg-white text-[#171717] flex items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 shadow-xl p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#8BCB50]/15 text-3xl text-[#5f9b2d]">
          {"♞\uFE0E"}
        </div>
        <h1 className="text-2xl font-extrabold">Sign in to play</h1>

        <div className="mt-6 flex justify-center">
          <GoogleLoginButton onSuccess={() => navigate(from, { replace: true })} />
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back to home
        </button>
      </div>
    </main>
  );
};