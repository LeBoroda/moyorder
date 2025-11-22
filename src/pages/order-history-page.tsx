import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { loadOrders, type SavedOrder } from "../services/order-history";
import React from "react";

export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrders(loadOrders(user.email));
  }, [user]);

  return (
    <section className="page history-page">
      <header>
        <h2>История заказов</h2>
        <p>Заказы хранятся локально для каждого аккаунта.</p>
      </header>

      {!user ? (
        <div className="card">
          <p>Авторизуйтесь, чтобы видеть историю заказов.</p>
        </div>
      ) : !orders.length ? (
        <div className="card">
          <p>Пока заказов нет. Сделайте первый заказ.</p>
        </div>
      ) : (
        <div className="history-list">
          {orders.map((order) => (
            <article key={order.id} className="card history-card">
              <header>
                <h3>
                  <Link to={`/history/${order.id}`} className="order-link">
                    {new Date(order.createdAt).toLocaleString()}
                  </Link>
                </h3>
                <p>{order.customerEmail}</p>
              </header>
              <ul>
                {order.lines
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((line) => (
                    <li key={line.id}>
                      {line.name} × {line.quantity}
                    </li>
                  ))}
              </ul>
              {order.comment && (
                <p className="history-comment">{order.comment}</p>
              )}
              <div className="order-actions">
                <Link to={`/history/${order.id}`} className="view-details-link">
                  Подробнее →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
