import { BrowserRouter, Routes, Route, Link, NavLink, Navigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import Home from "@/pages/Home";
import DayDetail from "@/pages/DayDetail";
import Login from "@/pages/Login";
import Placeholder from "@/pages/Placeholder";
import GuidePage from "@/pages/GuidePage";
import Planner from "@/pages/Planner";
import NotFound from "@/pages/NotFound";
import { RecordsProvider } from "@/pages/records/shared";
import { usePlanItinerary } from "@/guide/plannerSchedule";
import NotesPage from "@/pages/records/NotesPage";
import BookingsPage from "@/pages/records/BookingsPage";
import ExpensesPage from "@/pages/records/ExpensesPage";
import {
  AttractionDetailPage,
  RestaurantDetailPage,
  HotelDetailPage,
} from "@/pages/PlaceDetail";

const NAV = [
  { to: "/", label: "行程" },
  { to: "/bookings", label: "预订" },
  { to: "/planner", label: "行程规划" },
  { to: "/attractions", label: "景点" },
  { to: "/notes", label: "笔记" },
  { to: "/expenses", label: "记账" },
  { to: "/practical", label: "实用信息" },
  { to: "/research", label: "研究状态" },
];

function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const [confirmLogout, setConfirmLogout] = useState(false);
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
            <span className="font-bold text-teal-900">东南亚旅行指南</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {isAuthenticated ? (
              <>
                <span className="text-gray-500 truncate max-w-32">
                  {user?.email}
                </span>
                {confirmLogout ? (
                  <>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      确定退出？
                    </span>
                    <button
                      onClick={() => {
                        setConfirmLogout(false);
                        void logout();
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      确认退出
                    </button>
                    <button
                      onClick={() => setConfirmLogout(false)}
                      className="text-gray-500 hover:text-teal-800"
                    >
                      取消
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="text-gray-500 hover:text-teal-800"
                  >
                    退出
                  </button>
                )}
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
            <Route path="/" element={<RecordsProvider><Home /></RecordsProvider>} />
            <Route path="/day/:n" element={<RecordsProvider><DayDetail /></RecordsProvider>} />
            <Route path="/attraction/:slug" element={<AttractionDetailPage />} />
            <Route path="/restaurant/:slug" element={<RestaurantDetailPage />} />
            <Route path="/hotel/:slug" element={<HotelDetailPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/planner" element={<Planner />} />
            {/* 酒店/餐厅/航班/交通已并入 /bookings 二级菜单；地图已并入 /planner 子视图；旧链接跳转到对应位置 */}
            <Route path="/hotels" element={<Navigate to="/bookings?menu=hotels" replace />} />
            <Route path="/restaurants" element={<Navigate to="/bookings?menu=restaurants" replace />} />
            <Route path="/attractions" element={<GuidePage tab="景点" />} />
            <Route path="/practical" element={<GuidePage tab="实用信息" />} />
            <Route path="/flights" element={<Navigate to="/bookings?menu=flights" replace />} />
            <Route path="/transport" element={<Navigate to="/bookings?menu=transport" replace />} />
            <Route path="/map" element={<Navigate to="/planner?view=map" replace />} />
            <Route path="/research" element={<GuidePage tab="信息来源搜索状态" />} />
            <Route path="/guide" element={<Navigate to="/" replace />} />
            <Route
              path="/notes"
              element={
                <RecordsProvider>
                  <NotesPage />
                </RecordsProvider>
              }
            />
            <Route
              path="/packing"
              element={<Navigate to="/practical" replace />}
            />
            <Route
              path="/bookings"
              element={
                <RecordsProvider>
                  <BookingsPage />
                </RecordsProvider>
              }
            />
            <Route
              path="/expenses"
              element={
                <RecordsProvider>
                  <ExpensesPage />
                </RecordsProvider>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <SiteFooter />
      </div>
    </BrowserRouter>
  );
}

function SiteFooter() {
  const plan = usePlanItinerary();
  return (
    <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
      东南亚 {plan.totalDays} 天旅行指南 · {plan.dateRangeLong}
    </footer>
  );
}

export default function App() {
  return <AppRouter />;
}
