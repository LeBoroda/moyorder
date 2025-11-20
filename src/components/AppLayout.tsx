import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

const NAV_ITEMS = [
  { to: "/stock", label: "Доступные товары" },
  { to: "/history", label: "Предыдущие заказы" },
  { to: "/about", label: "О приложении" },
];

export default function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>MoySklad Order Maker</h1>
          <p className="app-subtitle">Создание заказов в сервисе МойСклад</p>
        </div>
        <div className="user-panel" data-testid="user-panel">
          {user ? (
            <>
              <div>
                <p className="user-name">{user.email}</p>
                <p className="user-email">
                  Уровень цен:{" "}
                  {user.priceLevel === "basic"
                    ? "Базовый прайс"
                    : "Скидочный прайс"}
                </p>
              </div>
              <button type="button" onClick={logout}>
                Выход
              </button>
            </>
          ) : (
            <p className="user-name">Пожалуйста, авторизуйтесь</p>
          )}
        </div>
      </header>

      {user && (
        <nav aria-label="Primary" className="app-nav">
          {NAV_ITEMS.map((item) => (
            <Link key={item.to} to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <a href="https://www.flaticon.com/free-icons/beer" title="beer icons">
          Beer icons created by Dreamcreateicons - Flaticon
        </a>
      </footer>
    </div>
  );
}
