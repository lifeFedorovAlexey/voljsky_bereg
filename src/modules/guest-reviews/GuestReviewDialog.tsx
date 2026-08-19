'use client'

import React, { useEffect, useRef, useState } from 'react'

import { GuestReviewForm } from './GuestReviewForm'

export function GuestReviewDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const previousBodyOverflowRef = useRef('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      document.body.style.overflow = previousBodyOverflowRef.current
    }
  }, [])

  function openDialog() {
    setSuccessMessage(null)
    dialogRef.current?.showModal()
    previousBodyOverflowRef.current = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }

  function closeDialog() {
    dialogRef.current?.close()
  }

  function handleDialogClose() {
    document.body.style.overflow = previousBodyOverflowRef.current
    setSuccessMessage(null)
    triggerRef.current?.focus()
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) closeDialog()
  }

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="vb-button vb-review-dialog__trigger"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        Оставить отзыв
      </button>

      <dialog
        aria-describedby="guest-review-dialog-description"
        aria-labelledby="guest-review-dialog-title"
        className="vb-review-dialog"
        onClick={handleBackdropClick}
        onClose={handleDialogClose}
        ref={dialogRef}
      >
        <div className="vb-review-dialog__surface">
          <header className="vb-review-dialog__header">
            <div>
              <h3 id="guest-review-dialog-title">Оставить отзыв</h3>
              <p id="guest-review-dialog-description">Имя и текст появятся на сайте после проверки.</p>
            </div>
            <button
              aria-label="Закрыть форму отзыва"
              className="vb-review-dialog__close"
              onClick={closeDialog}
              type="button"
            >
              Закрыть
            </button>
          </header>

          {successMessage ? (
            <div className="vb-review-dialog__success">
              <h4>Отзыв отправлен</h4>
              <p role="status">{successMessage}</p>
              <button className="vb-button" onClick={closeDialog} type="button">Готово</button>
            </div>
          ) : (
            <GuestReviewForm onSuccess={setSuccessMessage} />
          )}
        </div>
      </dialog>
    </>
  )
}
