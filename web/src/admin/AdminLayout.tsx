import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { clearAdminToken } from "./auth";

const nav = [
  { to: "/admin/quizzes", label: "题目" },
  { to: "/admin/screens/home", label: "首页展示" },
  { to: "/admin/screens/eva", label: "Eva展示" },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const onLogout = () => {
    clearAdminToken();
    navigate("/");
  };

  return (
    <div className="flex min-h-dvh flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              后台管理
            </span>
            <nav className="flex gap-2">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    location.pathname.startsWith(item.to)
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              返回前台
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
