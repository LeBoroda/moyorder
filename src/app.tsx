import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./app.css";
import AppLayout from "./components/app-layout";
import { AuthProvider, useAuth } from "./context/auth-context";
import AboutPage from "./pages/about-page";
import LoginPage from "./pages/login-page";
import OrderDetailPage from "./pages/order-detail-page";
import OrderHistoryPage from "./pages/order-history-page";
import StockPage from "./pages/stock-page";
import React from "react";

function RequireAuth() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  const { user } = useAuth();
  const defaultPath = user ? "/stock" : "/";

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/stock" element={<StockPage />} />
          <Route path="/history" element={<OrderHistoryPage />} />
          <Route path="/history/:orderId" element={<OrderDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
