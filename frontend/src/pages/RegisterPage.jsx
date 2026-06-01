import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { registerUser, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    try {
      await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate("/dashboard");
    } catch {
      setFormError("Registration failed. The email may already be in use.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm py-8">
        <div className="mb-7 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white">
            TM
          </div>
          <span className="text-xl font-bold tracking-tight">TaskManager</span>
        </div>

        <h1 className="mb-1 text-xl font-semibold">Create account</h1>
        <p className="mb-5 text-sm text-slate-500">
          Start organizing your tasks.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Name
          </label>
          <input
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
            required
          />

          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Email
          </label>
          <input
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />

          <label className="mb-1.5 block text-xs font-semibold text-slate-600">
            Password
          </label>
          <input
            className="mb-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 6 characters"
            minLength={6}
            required
          />

          {(formError || error) && (
            <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError || error}
            </p>
          )}

          <button
            className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-medium text-blue-600 hover:underline" to="/login">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
