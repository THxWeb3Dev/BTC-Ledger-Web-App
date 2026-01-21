<div align="center">
  <img src="preview.png" alt="BTC Ledger Dashboard" width="100%" style="border-radius: 10px; box-shadow: 0 0 20px rgba(247, 147, 26, 0.2);">

  <br />
  <br />

  <h1 style="font-size: 3rem;">⚡️ BTC Ledger</h1>

  <p>
    <strong>The Ultimate Sovereign Bitcoin Portfolio Tracker.</strong><br>
    <em>O Livro-Razão Definitivo para Gestão de Bitcoin.</em>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-privacy--security">Privacy</a> •
    <a href="#-license">License</a>
  </p>

  <img src="https://img.shields.io/badge/version-7.1.0-F7931A?style=for-the-badge&logo=bitcoin&logoColor=white" alt="Version">
  <img src="https://img.shields.io/badge/status-production-00E096?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/license-PROPRIETARY-FF3B30?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/data-local_storage-blue?style=for-the-badge" alt="Privacy">
</div>

<br />

## 📖 About / Sobre

**BTC Ledger** is a modern, serverless Web Application designed for the sovereign individual. It allows users to track their Bitcoin accumulation (DCA/HODL), calculate average buying price (Ticket Médio), and monitor portfolio performance in real-time without relying on third-party databases.

Este é um Web App moderno e *serverless* projetado para o indivíduo soberano. Permite rastrear a acumulação de Bitcoin, calcular o preço médio de compra (Ticket Médio) e monitorar a performance do portfólio em tempo real, sem depender de banco de dados de terceiros.

---

## 🚀 Features

* **⚡️ Zero Server / Zero KYC:** All data is stored locally on your device (`localStorage`).
* **📊 Smart Dashboard:** Real-time tracking of Balance, Satoshis, and Performance.
* **🎯 Average Price Logic:** Automatic calculation of your "Ticket Médio" (Average Buy Price) to indicate profit/loss zones.
* **📈 Live Charts:** Interactive charts for BTC/BRL and BTC/USD (powered by CoinGecko & Chart.js).
* **📱 Telegram Mini App Ready:** Fully optimized to run inside Telegram Bots.
* **💎 Glassmorphism UI:** Modern, dark-themed 3D glass design.
* **🔄 Backup & Restore:** Export your transaction history to a JSON file and restore it on any device.

---

## 🛠 Tech Stack

* **Core:** HTML5, CSS3 (Modern Variables & Flexbox), Vanilla JavaScript (ES6+).
* **Libraries:**
    * `Chart.js` (Visualizations)
    * `Telegram Web App SDK` (Integration)
* **API:** CoinGecko Public API (No API Key required).
* **Storage:** Browser LocalStorage (Persistence).

---

## 📂 Project Structure

```bash
BTC-LEDGER/
├── index.html      # Main Application (Logic + UI)
├── style.css       # Styling (Glassmorphism + Responsive)
├── script.js       # Business Logic (API, Charts, Storage)
├── manifest.json   # PWA Configuration
├── icon.png        # App Icon (192x192 or 512x512)
├── preview.png     # Social Share Image (1200x630)
├── LICENSE         # Proprietary License Terms
└── README.md       # Documentation
