import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, taskTitle }) {
  const { theme, lang } = useThemeLang();
  const isDark = theme === "dark";
  const t = translations[lang] || translations.vi;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop — no onClick so dialog stays open when clicking outside */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            key="dialog"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.94, y: 6  }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`fixed left-1/2 top-1/2 z-[10000] w-full max-w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-2xl ${
              isDark
                ? "border-slate-800 bg-[#0c101b] text-slate-100"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            {/* Icon */}
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              isDark ? "bg-rose-950/60" : "bg-rose-50"
            }`}>
              <svg className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>

            {/* Title */}
            <h2 className="mb-1 text-center text-base font-bold">{t.confirmDeleteTitle}</h2>

            {/* Task name preview */}
            {taskTitle && (
              <p className={`mb-4 text-center text-sm truncate px-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                &ldquo;{taskTitle}&rdquo;
              </p>
            )}

            {/* Message */}
            <p className={`mb-6 text-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {t.confirmDeleteMsg}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition cursor-pointer ${
                  isDark
                    ? "border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.cancelDelete}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition cursor-pointer"
              >
                {t.confirmDelete}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
