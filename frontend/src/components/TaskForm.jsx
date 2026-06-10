import { useState, useRef, useEffect } from "react";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";

export default function TaskForm({ onAddTask, theme = "dark" }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const formRef = useRef(null);

  const { lang } = useThemeLang();
  const t = translations[lang] || translations.vi;
  const isDark = theme === "dark";

  // Close the form if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target) && title.trim() === "" && description.trim() === "") {
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, description]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    onAddTask({
      title: trimmedTitle,
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      status: "pending"
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setIsExpanded(false);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`w-full rounded-xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 ${
        isDark
          ? "border-slate-800/80 bg-slate-900/40 hover:border-slate-700/60"
          : "border-slate-200/85 bg-white/75 hover:border-slate-300 shadow-slate-100/50"
      }`}
    >
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!isExpanded) setIsExpanded(true);
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder={t.writeTaskPlaceholder}
          className={`w-full bg-transparent text-base font-semibold outline-none transition-colors duration-300 ${
            isDark ? "text-slate-100 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
          }`}
          required
        />

        {isExpanded && (
          <div className={`space-y-4 border-t pt-3 transition-all duration-300 animate-fadeIn ${
            isDark ? "border-slate-800/60" : "border-slate-100"
          }`}>
            {/* Description Textarea */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.addDescriptionPlaceholder}
              rows={2}
              className={`w-full resize-none bg-transparent text-sm outline-none transition-colors duration-300 ${
                isDark ? "text-slate-300 placeholder-slate-500" : "text-slate-650 placeholder-slate-400"
              }`}
            />

            {/* Meta options: Priority, Due Date */}
            <div className={`flex flex-wrap items-center justify-between gap-4 border-t pt-3 ${
              isDark ? "border-slate-800/40" : "border-slate-100"
            }`}>
              <div className="flex flex-wrap items-center gap-3">
                {/* Priority Selection */}
                <div className={`flex items-center gap-1 rounded-lg p-1 border transition-colors duration-300 ${
                  isDark ? "bg-slate-950/60 border-slate-850" : "bg-slate-50 border-slate-200/60"
                }`}>
                  {["low", "medium", "high"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                        priority === p
                          ? p === "high"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : p === "medium"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : isDark
                            ? "bg-slate-700/30 text-slate-400 border border-slate-700/20"
                            : "bg-slate-200 text-slate-700 border border-slate-300/40"
                          : isDark
                          ? "text-slate-500 hover:text-slate-300"
                          : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {p === "low" ? t.low : p === "medium" ? t.medium : t.high}
                    </button>
                  ))}
                </div>

                {/* Due Date Picker */}
                <div className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1 border transition-colors duration-300 ${
                  isDark ? "bg-slate-950/60 border-slate-850 text-slate-400" : "bg-slate-50 border-slate-200/60 text-slate-500"
                }`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.8"
                    stroke="currentColor"
                    className="h-4 w-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="bg-transparent outline-none cursor-pointer text-slate-350 dark:text-slate-300"
                    style={{ colorScheme: isDark ? "dark" : "light" }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    setPriority("medium");
                    setDueDate("");
                    setIsExpanded(false);
                  }}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    isDark ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all duration-150 cursor-pointer"
                >
                  {t.addTask}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
