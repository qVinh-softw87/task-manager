import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const { loginUser, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const { theme, toggleTheme, lang, toggleLang } = useThemeLang();
  const isDark = theme === "dark";
  const t = translations[lang] || translations.vi;

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const trimmedEmail = email.trim();

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setFormError(t.loginErrorEmail);
      return;
    }

    try {
      await loginUser({
        email: trimmedEmail,
        password,
      });
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || t.loginErrorDefault);
    }
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className={`flex min-h-screen items-center justify-center px-4 relative transition-colors duration-300 ${
        isDark ? "bg-[#080b11] text-slate-100" : "bg-[#f8fafc] text-black"
      }`}
    >
      {/* Top-Right Settings bar */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm ${
            isDark
              ? "border-slate-800 bg-slate-950/60 text-slate-300 hover:text-slate-100 hover:bg-slate-900/50"
              : "border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50"
          }`}
          title="Switch language"
        >
          {lang === "vi" ? "EN" : "VI"}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg border transition-all duration-200 cursor-pointer shadow-sm ${
            isDark
              ? "border-slate-800 bg-slate-950/60 text-amber-400 hover:text-amber-300 hover:bg-slate-900/50"
              : "border-slate-200 bg-white text-indigo-600 hover:text-indigo-700 hover:bg-slate-50"
          }`}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.95 4.95l1.58 1.58m9.02 9.02l1.58 1.58M3 12h2.25m13.5 0H21M5.75 5.75l1.58 1.58m9.02 9.02l1.58 1.58M12 7.75a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
          )}
        </button>
      </div>

      {/* Login Card */}
      <div className={`w-full max-w-[400px] rounded-[12px] border py-[36px] px-[32px] shadow-xl backdrop-blur-md transition-all duration-300 ${
        isDark 
          ? "border-slate-900/60 bg-[#0c101b]/95 text-slate-100" 
          : "border-slate-200/80 bg-white/95 text-slate-900 shadow-slate-100"
      }`}>
        {/* LOGO / HEADER CARD */}
        <div className="mb-[28px] text-center font-sans">
          <h1 className={`text-[22px] font-bold tracking-tight bg-clip-text text-transparent transition-all duration-300 ${
            isDark
              ? "bg-gradient-to-r from-white via-slate-200 to-slate-400"
              : "bg-gradient-to-r from-slate-950 via-slate-800 to-slate-600"
          }`}>
            {t.loginTitle}
          </h1>
          <p className={`mt-1 text-[13px] transition-colors duration-300 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {t.loginSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-[16px]">
          <div>
            <label className={`mb-[6px] block text-[11px] font-bold uppercase tracking-[0.06em] transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-black"
            }`}>
              {t.emailLabel}
            </label>
            <input
              className={`h-[42px] w-full rounded-[8px] border px-[14px] text-[14px] outline-none transition-all duration-150 focus:border-indigo-500 ${
                isDark 
                  ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600" 
                  : "border-slate-200 bg-slate-50 text-black placeholder-slate-400"
              }`}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t.emailPlaceholder}
              required
            />
          </div>

          <div>
            <label className={`mb-[6px] block text-[11px] font-bold uppercase tracking-[0.06em] transition-colors duration-300 ${
              isDark ? "text-slate-400" : "text-black"
            }`}>
              {t.passwordLabel}
            </label>
            <input
              className={`h-[42px] w-full rounded-[8px] border px-[14px] text-[14px] outline-none transition-all duration-150 focus:border-indigo-500 ${
                isDark 
                  ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600" 
                  : "border-slate-200 bg-slate-50 text-black placeholder-slate-400"
              }`}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t.passwordPlaceholder}
              required
            />
          </div>

          {(formError || error) && (
            <p className={`rounded-[8px] border border-rose-500/25 bg-rose-500/10 px-3.5 py-2 text-[13px] font-medium ${
              isDark ? "text-rose-400" : "text-rose-600"
            }`}>
              {formError || error}
            </p>
          )}

          <div className="pt-[8px]">
            <button
              className={`h-[42px] w-full rounded-[8px] text-[14px] font-bold transition-all duration-150 cursor-pointer shadow-md disabled:cursor-not-allowed disabled:opacity-80 ${
                isDark
                  ? "bg-gradient-to-r from-indigo-400 to-purple-400 hover:from-indigo-300 hover:to-purple-300 text-slate-950 shadow-indigo-400/10 disabled:from-slate-800 disabled:to-slate-900 disabled:text-slate-500"
                  : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-indigo-600/10 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400"
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? t.loggingIn : t.loginButton}
            </button>
          </div>
        </form>

        <p className={`mt-[24px] text-center text-[13px] transition-colors duration-300 ${
          isDark ? "text-slate-500" : "text-black"
        }`}>
          {t.noAccount}{" "}
          <Link
            className="font-bold text-indigo-500 hover:text-indigo-400 hover:underline transition-colors duration-150"
            to="/register"
          >
            {t.registerLink}
          </Link>
        </p>
      </div>
    </motion.main>
  );
}

