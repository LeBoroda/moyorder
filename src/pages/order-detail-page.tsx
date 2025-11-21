import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { getOrderById, type SavedOrder } from "../services/order-history";
import React from "react";

export default function OrderDetailPage() {
  const { user } = useAuth();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !orderId) {
      setLoading(false);
      return;
    }
    const foundOrder = getOrderById(user.email, orderId);
    setOrder(foundOrder);
    setLoading(false);
  }, [user, orderId]);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <section className="page order-detail-page">
        <div className="card">
          <p>Загрузка...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="page order-detail-page">
        <div className="card">
          <h2>Заказ не найден</h2>
          <p>Заказ с указанным идентификатором не существует.</p>
          <Link to="/history">Вернуться к истории заказов</Link>
        </div>
      </section>
    );
  }

  const totalQuantity = order.lines.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );

  return (
    <section className="page order-detail-page">
      <header>
        <h2>Детали заказа</h2>
        <p>
          Информация о заказе от {new Date(order.createdAt).toLocaleString()}
        </p>
      </header>

      <div className="card order-detail-card">
        <div className="order-detail-header">
          <div>
            <h3>Заказ #{order.id.slice(-8)}</h3>
            <p className="order-date">
              Создан: {new Date(order.createdAt).toLocaleString("ru-RU")}
            </p>
            <p className="order-email">Email: {order.customerEmail}</p>
          </div>
          <Link to="/history" className="back-link">
            ← Назад к истории
          </Link>
        </div>

        {order.comment && (
          <div className="order-comment-section">
            <h4>Комментарий к заказу:</h4>
            <p className="order-comment">{order.comment}</p>
          </div>
        )}

        <div className="order-lines-section">
          <h4>Позиции заказа ({order.lines.length}):</h4>
          <div className="order-lines-table">
            <div className="order-line-header">
              <span>Наименование</span>
              <span>Количество</span>
            </div>
            {order.lines
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((line) => (
                <div key={line.id} className="order-line-row">
                  <span className="line-name">{line.name}</span>
                  <span className="line-quantity">× {line.quantity}</span>
                </div>
              ))}
          </div>
          <div className="order-total">
            <strong>Всего позиций: {totalQuantity}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
