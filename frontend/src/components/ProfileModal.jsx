import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useThemeLang } from "../context/ThemeLangContext";
import { useToast } from "../context/ToastContext";
import { translations } from "../utils/translations";
import * as authApi from "../api/authApi";
import { getErrorMessage } from "../utils/errorHandler";

export default function ProfileModal({ isOpen, onClose, onSaveSuccess }) {
  const { user, setUser } = useAuth();
  const { theme, lang } = useThemeLang();
  const toast = useToast();
  
  const isDark = theme === "dark";
  const t = translations[lang] || translations.vi;

  // Local state for Profile Form
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // Local state for Password Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Handle image selection and canvas compression
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError(lang === "vi" ? "Vui lòng chọn tệp hình ảnh." : "Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 150; // 150x150 square crop for avatar
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        // Center crop calculation
        const sourceSize = Math.min(img.width, img.height);
        const sourceX = (img.width - sourceSize) / 2;
        const sourceY = (img.height - sourceSize) / 2;

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          size,
          size
        );

        // Compress to JPEG with 0.8 quality
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8);
        setAvatar(compressedBase64);
        setProfileError("");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const removeAvatar = () => {
    setAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit profile updates
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (trimmedName.length < 2) {
      setProfileError(t.registerErrorName);
      setProfileLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setProfileError(t.registerErrorEmail);
      setProfileLoading(false);
      return;
    }

    try {
      const res = await authApi.updateProfile({
        name: trimmedName,
        email: trimmedEmail,
        avatar: avatar,
      });

      // Update in-memory Auth context
      setUser((prev) => ({
        ...prev,
        name: res.data.name,
        email: res.data.email,
        avatar: res.data.avatar,
      }));

      setProfileSuccess(t.updateSuccess || "Cập nhật hồ sơ thành công!");
      toast.success(t.updateSuccess || "Cập nhật hồ sơ thành công!");
      if (onSaveSuccess) onSaveSuccess(t.updateSuccess);
    } catch (err) {
      setProfileError(getErrorMessage(err, t, t.updateError));
    } finally {
      setProfileLoading(false);
    }
  };

  // Submit password updates
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmNewPassword.trim();

    if (!trimmedCurrent || !trimmedNew) {
      setPasswordError(lang === "vi" ? "Vui lòng nhập đầy đủ mật khẩu." : "Please fill in all fields.");
      return;
    }

    if (trimmedNew.length < 6) {
      setPasswordError(t.registerErrorPasswordLength);
      return;
    }

    if (!/[a-zA-Z]/.test(trimmedNew) || !/\d/.test(trimmedNew)) {
      setPasswordError(t.registerErrorPasswordPattern);
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setPasswordError(lang === "vi" ? "Mật khẩu xác nhận không khớp." : "Confirm password does not match.");
      return;
    }

    setPasswordLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: trimmedCurrent,
        newPassword: trimmedNew,
      });

      setPasswordSuccess(t.changePasswordSuccess || "Đổi mật khẩu thành công!");
      toast.success(t.changePasswordSuccess || "Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(getErrorMessage(err, t, t.changePasswordError));
    } finally {
      setPasswordLoading(false);
    }
  };

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`relative z-10 w-full max-w-[550px] overflow-hidden rounded-[16px] border shadow-2xl transition-colors duration-200 flex flex-col max-h-[90vh] ${
            isDark
              ? "border-slate-800 bg-[#0c101b] text-slate-100"
              : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-slate-800/80 bg-slate-950/20" : "border-slate-100 bg-slate-50/50"
          }`}>
            <h2 className="text-base font-bold tracking-tight">
              {t.profileTitle || "Thông tin cá nhân"}
            </h2>
            <button
              onClick={onClose}
              className={`rounded-lg p-1.5 transition-colors cursor-pointer ${
                isDark ? "text-slate-400 hover:bg-slate-800 hover:text-slate-100" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4.5 h-4.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
            
            {/* VÙNG 1: THÔNG TIN HỒ SƠ & AVATAR */}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {t.changeInfoTitle || "Cập nhật hồ sơ"}
              </h3>

              {/* Avatar Selector */}
              <div className="flex items-center gap-5 pt-1">
                <div className="relative group">
                  <div
                    onClick={triggerFileSelect}
                    className={`relative flex h-16 w-16 cursor-pointer items-center justify-center rounded-full text-lg font-bold border shadow-sm overflow-hidden transition-all duration-300 ${
                      isDark 
                        ? "border-slate-800 bg-slate-950/60 text-indigo-400 group-hover:border-indigo-500/50" 
                        : "border-slate-200 bg-slate-50 text-indigo-600 group-hover:border-indigo-400"
                    }`}
                    title={t.editAvatarTooltip || "Thay đổi ảnh đại diện"}
                  >
                    {avatar ? (
                      <img src={avatar} alt="Avatar Preview" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                      </svg>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-150 cursor-pointer ${
                      isDark
                        ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:text-slate-100 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    {avatar ? (lang === "vi" ? "Thay đổi" : "Change photo") : (lang === "vi" ? "Tải ảnh lên" : "Upload photo")}
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="text-left text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      {lang === "vi" ? "Gỡ ảnh" : "Remove photo"}
                    </button>
                  )}
                </div>
              </div>

              {/* Name Input */}
              <div className="grid gap-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`h-10 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder={t.namePlaceholder}
                  required
                />
              </div>

              {/* Email Input */}
              <div className="grid gap-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t.emailLabel}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-10 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder={t.emailPlaceholder}
                  required
                />
              </div>

              {profileError && (
                <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-500">
                  {profileError}
                </p>
              )}

              {profileSuccess && (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-500">
                  {profileSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={profileLoading}
                className={`w-full h-10 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark
                    ? "bg-indigo-500 text-white hover:bg-indigo-400 disabled:bg-indigo-950 disabled:text-indigo-400"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-200 disabled:text-indigo-400"
                }`}
              >
                {profileLoading && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {profileLoading ? (t.savingChanges || "Đang lưu...") : (t.saveChanges || "Lưu thay đổi")}
              </button>
            </form>

            <hr className={`border-t ${isDark ? "border-slate-800/80" : "border-slate-100"}`} />

            {/* VÙNG 2: THAY ĐỔI MẬT KHẨU */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {t.changePasswordTitle || "Thay đổi mật khẩu"}
              </h3>

              {/* Current Password */}
              <div className="grid gap-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t.currentPasswordLabel || "Mật khẩu hiện tại"}
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`h-10 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>

              {/* New Password */}
              <div className="grid gap-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {t.newPasswordLabel || "Mật khẩu mới"}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`h-10 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>

              {/* Confirm New Password */}
              <div className="grid gap-1">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {lang === "vi" ? "Xác nhận mật khẩu mới" : "Confirm New Password"}
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={`h-10 w-full rounded-lg border px-3.5 text-sm outline-none transition focus:border-indigo-500 ${
                    isDark
                      ? "border-slate-800 bg-slate-950/60 text-slate-200 placeholder-slate-600"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>

              {passwordError && (
                <p className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-500">
                  {passwordError}
                </p>
              )}

              {passwordSuccess && (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-500">
                  {passwordSuccess}
                </p>
              )}

              <button
                type="submit"
                disabled={passwordLoading}
                className={`w-full h-10 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  isDark
                    ? "bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
                    : "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                }`}
              >
                {passwordLoading && (
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {passwordLoading ? (t.savingChanges || "Đang lưu...") : (lang === "vi" ? "Đổi mật khẩu" : "Change Password")}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
