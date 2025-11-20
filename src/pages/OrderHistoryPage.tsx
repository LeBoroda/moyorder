import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loadOrders, type SavedOrder } from "../services/orderHistory";
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
                <h3>{new Date(order.createdAt).toLocaleString()}</h3>
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
