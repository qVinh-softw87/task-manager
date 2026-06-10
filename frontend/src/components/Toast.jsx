import { AnimatePresence, motion } from "framer-motion";
import { useToastState } from "../context/ToastContext";
import { useThemeLang } from "../context/ThemeLangContext";

const icons = {
  success: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const typeStyles = {
  success: {
    dark:  "border-emerald-500/30 bg-emerald-950/80 text-emerald-300",
    light: "border-emerald-200   bg-emerald-50     text-emerald-700",
    bar:   "bg-emerald-500",
  },
  error: {
    dark:  "border-rose-500/30 bg-rose-950/80 text-rose-300",
    light: "border-rose-200   bg-rose-50     text-rose-700",
    bar:   "bg-rose-500",
  },
  info: {
    dark:  "border-indigo-500/30 bg-indigo-950/80 text-indigo-300",
    light: "border-indigo-200   bg-indigo-50     text-indigo-700",
    bar:   "bg-indigo-500",
  },
};

function ToastItem({ toast, onDismiss, isDark }) {
  const style = typeStyles[toast.type] || typeStyles.info;
  const colorClass = isDark ? style.dark : style.light;

  return (
    <div
      className={`relative flex items-start gap-3 overflow-hidden rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl min-w-[260px] max-w-[360px] ${colorClass}`}
    >
      {/* Colored left bar */}
      <span className={`absolute left-0 top-0 h-full w-1 rounded-l-xl ${style.bar}`} />

      <span className="mt-0.5">{icons[toast.type]}</span>

      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>

      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 opacity-50 hover:opacity-100 transition cursor-pointer"
        aria-label="Close"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastStack() {
  const { toasts, dismiss } = useToastState();
  const { theme } = useThemeLang();
  const isDark = theme === "dark";

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1    }}
            exit={{    opacity: 0, y: 15,  scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="pointer-events-auto"
          >
            <ToastItem toast={t} onDismiss={dismiss} isDark={isDark} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
