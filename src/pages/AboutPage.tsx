import React from "react";

export default function AboutPage() {
  return (
    <section className="page about-page">
      <header>
        <h2>О программе MoySklad Order Maker</h2>
      </header>

      <div className="card">
        <p>
          Это небольшое приложение на основе сервиса МойСклад. Оно позволяет
          просматривать остатки по товарам, создавать предварительный заказ и
          отправлять его по электронной почте вашему менеджеру в пару кликов.
        </p>
        <ul className="about-list">
          <li>Показывает актуальные остатки в сервиисе MoySklad.</li>
          <li>Позволяет легко создать заказ и указывает общую сумму.</li>
          <li>Локально сохраняет ранее созданные заказы.</li>
          <li>Адаптируется под размер экрана устройства.</li>
        </ul>
      </div>
    </section>
  );
}
