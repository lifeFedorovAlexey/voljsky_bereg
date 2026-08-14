import React from 'react'

import './index.css'

const actions = [
  {
    href: '/admin/collections/pages',
    title: 'Редактировать страницы',
    text: 'Тексты, изображения, порядок и состав блоков.',
  },
  {
    href: '/admin/collections/media',
    title: 'Открыть медиатеку',
    text: 'Загрузить фотографии, иллюстрации и схемы.',
  },
  {
    href: '/admin/globals/header',
    title: 'Изменить верхнее меню',
    text: 'Настроить ссылки в шапке сайта.',
  },
  {
    href: '/admin/globals/footer',
    title: 'Изменить нижнее меню',
    text: 'Настроить ссылки и информацию в подвале сайта.',
  },
] as const

const BeforeDashboard: React.FC = () => (
  <section className="before-dashboard">
    <div className="before-dashboard__intro">
      <p className="before-dashboard__eyebrow">Панель управления</p>
      <h1>Сайт «Иенево. Берег»</h1>
      <p>Выберите, что хотите изменить. Все изменения можно сохранить как черновик и проверить перед публикацией.</p>
      <a className="before-dashboard__site-link" href="/" target="_blank" rel="noreferrer">
        Открыть сайт ↗
      </a>
    </div>

    <div className="before-dashboard__actions">
      {actions.map((action, index) => (
        <a className="before-dashboard__action" href={action.href} key={action.href}>
          <span>0{index + 1}</span>
          <strong>{action.title}</strong>
          <small>{action.text}</small>
        </a>
      ))}
    </div>

    <div className="before-dashboard__help">
      <strong>Как изменить страницу</strong>
      <ol>
        <li>Откройте раздел «Страницы» и выберите нужную страницу.</li>
        <li>В «Содержимом страницы» раскройте блок или добавьте новый.</li>
        <li>Нажмите «Сохранить черновик», проверьте предпросмотр и затем опубликуйте.</li>
      </ol>
    </div>
  </section>
)

export default BeforeDashboard
