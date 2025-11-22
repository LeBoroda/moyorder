import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import React from "react";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate("/stock", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      setError("Введите свой электрический почтовый адрес.");
      return;
    }
    const ok = login(email);
    if (!ok) {
      setError(
        "Логин неверный. Используйте зарегистрированный адрес электронной почты.",
      );
      return;
    }
    navigate("/stock");
  };

  return (
    <section className="page login-page">
      <header>
        <h2>Добро пожаловать</h2>
        <p>Авторизуйтесь при помощи адреса электронной почты.</p>
      </header>

      <form onSubmit={handleSubmit} className="card">
        <label>
          Work email
          <input
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="buyer@company.ru"
            required
          />
        </label>

        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}

        <button type="submit">Войти</button>
      </form>

      <p className="hint">
        Заказ можно сделать только после авторизации при помощи рабочего адреса
        электронной почты.
      </p>
    </section>
  );
}
