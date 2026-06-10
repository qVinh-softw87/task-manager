import { useState, useEffect } from "react";
import { getAnalytics } from "../api/taskApi";
import { useToast } from "../context/ToastContext";
import { useThemeLang } from "../context/ThemeLangContext";
import { translations } from "../utils/translations";
import { getErrorMessage } from "../utils/errorHandler";

export function useAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const toast = useToast();
    const { lang } = useThemeLang();
    const t = translations[lang] || translations.vi;

    async function fetchAnalytics() {
        setLoading(true);
        try {
            const result = await getAnalytics();
            setData(result.data);
            setError("");
        } catch (err) {
            const msg = getErrorMessage(err, t);
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        data,
        loading,
        error,
        refresh: fetchAnalytics
    };
}
