import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { orderController } from "../controllers/order-controller";
import { useAuth } from "../context/auth-context";
import { useStockQuery } from "../hooks/use-stock-query";
import type { StockItem } from "../services/moysklad-client";
import React from "react";

type OrderFormState = Record<string, number>;

function buildOrderLines(stock: StockItem[], formState: OrderFormState) {
  return stock
    .map((item) => ({
      item,
      quantity: formState[item.id] ?? 0,
    }))
    .filter(({ quantity }) => quantity > 0);
}

export default function StockPage() {
  const { user } = useAuth();
  const priceLevel = user?.priceLevel ?? "basic";
  const { data: stock, loading, error } = useStockQuery(priceLevel);
  const [quantities, setQuantities] = useState<OrderFormState>({});
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  // Filter products for:
  // - Start with "Jaws" (case-insensitive) for demo reasons
  // - Contain "мл" somewhere in the name for demo reasons
  // - Have available stock > 0
  // - Sort by name
  const availableStock = useMemo(
    () =>
      stock
        .filter(
          (item: { available: number; name: string }) =>
            item.available > 0 &&
            item.name.toLowerCase().startsWith("jaws") &&
            item.name.includes("мл"),
        )
        .sort((a: { name: string }, b: { name: string }) =>
          a.name.localeCompare(b.name),
        ),
    [stock],
  );

  const lines = useMemo(
    () => buildOrderLines(availableStock, quantities),
    [availableStock, quantities],
  );

  const totalPositions = lines.reduce(
    (acc, { quantity, item }) => ({
      units: acc.units + quantity,
      value: acc.value + quantity * item.price,
    }),
    { units: 0, value: 0 },
  );

  const handleQtyChange = (id: string, value: number) => {
    setQuantities((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[id];
      } else {
        next[id] = value;
      }
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    if (!lines.length) {
      setStatus("Add at least one position to send an order.");
      return;
    }
    setSubmitting(true);
    setStatus(null);
    try {
      await orderController.submit({
        customerEmail: user.email,
        comment,
        lines,
      });
      setQuantities({});
      setComment("");
      setStatus("Order sent to the sales department.");
    } catch (submitError) {
      setStatus(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page stock-page">
      <header>
        <h2>Доступно к заказу</h2>
        <p>Выберете необходимое количество для заказа.</p>
        <p className="hint">
          Уровень цен{" "}
          {priceLevel === "basic" ? "базовый прайс" : "скидочный прайс"} для{" "}
          {user?.email}.
        </p>
      </header>

      {loading && <p>Загружаю остатки...</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <form className="card" onSubmit={handleSubmit} aria-label="Order form">
          <div className="stock-table" role="table">
            <div className="stock-row stock-row--head" role="row">
              <span role="columnheader">Наименование</span>
              <span role="columnheader">Доступно</span>
              <span role="columnheader">Цена, ₽</span>
              <span role="columnheader">Количество в заказе</span>
            </div>

            {availableStock.map((item) => (
              <div key={item.id} className="stock-row" role="row">
                <span role="cell">{item.name}</span>
                <span role="cell">{item.available}</span>
                <span role="cell">{item.price.toLocaleString("ru-RU")}</span>
                <span role="cell">
                  <input
                    type="number"
                    min={0}
                    max={item.available}
                    value={quantities[item.id] ?? ""}
                    onChange={(event) => {
                      const raw = event.target.value;
                      const numericValue = raw === "" ? 0 : Number(raw);
                      handleQtyChange(item.id, numericValue);
                    }}
                    aria-label={`Quantity for ${item.name}`}
                  />
                </span>
              </div>
            ))}
          </div>

          <label>
            Комментарий к заказу (необязательно)
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={3}
            />
          </label>

          <div className="order-summary">
            <p>
              Итого количество: <strong>{totalPositions.units}</strong>
            </p>
            <p>
              Сумма заказа:{" "}
              <strong>{totalPositions.value.toLocaleString("ru-RU")} ₽</strong>
            </p>
          </div>

          {status && (
            <p role="status" className="form-message">
              {status}
            </p>
          )}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Отправка…" : "Отправить заказ"}
          </button>
        </form>
      )}
    </section>
  );
}
