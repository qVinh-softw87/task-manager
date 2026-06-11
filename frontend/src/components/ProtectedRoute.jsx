import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#080b11] transition-colors duration-300">
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex h-12 w-12 items-center justify-center">
            <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 duration-1000" />
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-transparent border-t-indigo-600 dark:border-t-indigo-400 border-r-indigo-600/30 dark:border-r-indigo-400/30" />
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
