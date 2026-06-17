import React from 'react';

function Loading() {
  return (
    <main className="loading-screen">
      <img src="/whatsapp-logo.svg" alt="WhatsApp" />
      <div className="loading-spinner" role="status" aria-label="Loading" />
    </main>
  )
}

export default Loading;
