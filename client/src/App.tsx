import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "@/pages/Home";
import DayDetail from "@/pages/DayDetail";
import Login from "@/pages/Login";
import Placeholder from "@/pages/Placeholder";
import GuidePage from "@/pages/GuidePage";
import Planner from "@/pages/Planner";
import NotFound from "@/pages/NotFound";

const NAV = [
  { to: "/", label: "行程" },
  { to: "/guide", label: "攻略" },
  { to: "/map", label: "地图" },
  { to: "/planner", label: "行程规划" },
  { to: "/notes", label: "笔记" },
  { to: "/packing", label: "打包" },
  { to: "/bookings", label: "预订" },
  { to: "/expenses", label: "记账" },
  { to: "/favorites", label: "收藏" },
];

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <header className="sticky top-0 z-10 bg-[#f7f4ee]/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={`${import.meta.env.BASE_URL}images/logo.svg`}
              alt="Logo"
              className="w-7 h-7"
            />
            <span className="font-bold text-teal-900">东南亚20天</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {isAuthenticated ? (
              <>
                <span className="text-gray-500 truncate max-w-32">
                  {user?.email}
                </span>
                <button
                  onClick={() => void logout()}
                  className="text-gray-500 hover:text-teal-800"
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-sm font-medium hover:bg-teal-800"
              >
                登录
              </Link>
            )}
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                  isActive
                    ? "bg-teal-700 text-white font-medium"
                    : "text-gray-600 hover:bg-gray-200/60"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function AppRouter() {
  // basename="/sea-travel-guide" because the site is served from the GitHub Pages project subpath
  return (
    <BrowserRouter basename="/sea-travel-guide">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/day/:n" element={<DayDetail />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/map"
              element={<Placeholder title="地图" note="P2 填充：20 天行程地图" />}
            />
            <Route path="/planner" element={<Planner />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route
              path="/notes"
              element={<Placeholder title="笔记" note="P3 填充：云端同步笔记（sea_notes）" />}
            />
            <Route
              path="/packing"
              element={<Placeholder title="打包清单" note="P3 填充：云端同步打包清单（sea_packing）" />}
            />
            <Route
              path="/bookings"
              element={<Placeholder title="预订记录" note="P3 填充：酒店/机票预订（sea_bookings）" />}
            />
            <Route
              path="/expenses"
              element={<Placeholder title="记账" note="P4 填充：旅行记账（sea_expenses）" />}
            />
            <Route
              path="/favorites"
              element={<Placeholder title="收藏" note="P4 填充：收藏的景点/餐厅/酒店（sea_favorites）" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
          东南亚 20 天旅行指南 · 2026-12-12 ～ 2026-12-31
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return <AppRouter />;
}
