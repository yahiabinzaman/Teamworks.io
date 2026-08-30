# Teamworks.io — Real-Time Production & Visual Review Management Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![NodeJS](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.io](https://img.shields.io/badge/RealTime-Socket.io%20v4-010101?style=flat&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Electron](https://img.shields.io/badge/Desktop-Electron%20v34-47848F?style=flat&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Cloud-black?style=flat)]()

A high-performance, real-time internal **work management and visual design review system** built for high-throughput creative studios, print agencies, and design teams. Inspired by **Frame.io** and modern Kanban workflows, Teamworks.io unifies active production tracking, point-and-click pin annotations, NAS file server bridge launching, and direct client WhatsApp connectivity in a minimalist dark-mode interface.

---

## ⚡ Key Features

* **📌 Frame.io Style Visual Review Player**:
  * Point-and-click coordinate pin annotation on high-resolution graphic proofs (PSD / AI exports / JPG / PNG).
  * Interactive Before/After split comparison slider to inspect revisions side-by-side.
  * Versioning tracking (`v01`, `v02`, `v03`) with status toggles (`Open` / `Resolved`) and celebration triggers on approval.

* **📊 8-Stage Production Kanban Board**:
  * Real-time drag-and-drop workflow: `Backlog` ➔ `Assigned` ➔ `In Progress` ➔ `Internal Review` ➔ `Client Review` ➔ `Revision` ➔ `Approved` ➔ `Delivered`.
  * Zero-latency LAN state synchronization powered by WebSockets (`Socket.io`).

* **📂 Native NAS / File Server OS Bridge**:
  * 1-click launcher for central storage folders and active working files (`.psd`, `.ai`, `.indd`) across macOS (`open smb://...`) and Windows Explorer (`explorer \\...`).
  * Direct support for multi-drive storage layouts and annual production archive indexing.

* **💬 Instant Client WhatsApp Integration**:
  * 1-click pre-filled WhatsApp Web conversation launcher for every task card and client directory.

* **👥 Role-Based Workload Balancer**:
  * Dynamic capacity and workload distribution metrics for Admin, Lead Designer, Designers, and Motion Editors.

* **🖥️ Cross-Platform Deployment (Web + Native Desktop)**:
  * Available as a browser web application and standalone frameless **Electron Desktop Application** for macOS (`.app` / `.dmg`) and Windows (`.exe`).

---

## 📁 Repository Structure

```text
Teamworks.io/
├── electron/
│   ├── main.cjs            # Electron main process & OS file bridge
│   └── preload.cjs         # Context bridge for native execution
├── server/
│   ├── index.js            # Express REST API & Socket.io real-time engine
│   ├── database.js         # JSON database layer with persistence
│   ├── sampleData.js       # Client taxonomy & initial data seeds
│   └── colorlab_db.json    # Production database store
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Header, role switcher, NAS drive selector
│   │   ├── Dashboard.jsx       # Studio metrics, urgent queue & workload
│   │   ├── KanbanBoard.jsx     # 8-column drag-and-drop pipeline
│   │   ├── ReviewPlayer.jsx    # Visual pin annotator & before/after slider
│   │   ├── TaskModal.jsx       # Task creator with searchable client filter
│   │   ├── ClientsView.jsx     # Client directory & WhatsApp generator
│   │   ├── ServerSettingsModal.jsx # Central Server IP config & LAN sync
│   │   ├── WorkloadView.jsx    # Designer load balancer & analytics
│   │   ├── ActivityFeed.jsx    # Real-time studio audit stream
│   │   └── ToastContainer.jsx  # Notification toast alerts
│   ├── context/
│   │   └── AppContext.jsx      # Global state, Socket.io listener & API actions
│   ├── App.jsx                 # Main layout & router container
│   ├── index.css               # Design system & frosted glass styling
│   └── main.jsx                # React DOM root entry
├── public/                     # Static assets & brand icons
├── render.yaml                 # 1-click cloud deployment spec for Render.com
├── start-colorlab.bat          # 1-click Windows desktop software launcher
├── start-mac.command           # 1-click macOS desktop software launcher
├── package.json                # Project dependencies & build scripts
└── vite.config.js              # Vite server & proxy configuration
```

---

## 🚀 Quick Start & Installation

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18.0 or later)
* `npm` (included with Node.js)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/yahiabinzaman/Teamworks.io.git
cd Teamworks.io
npm install
```

### 3. Running Locally (Development Mode)
```bash
# Start both Backend API Server (Port 5050) & Frontend (Port 3000)
npm run start
```
* **Local Web Access**: `http://localhost:3000`
* **Local Network (LAN) Access**: `http://[HOST-IP]:3000`

### 4. Running as Standalone Desktop App (Electron)
```bash
npm run electron:dev
```

### 5. Packaging Desktop Binaries
```bash
# Package for macOS (.dmg / .app) or Windows (.exe)
npm run electron:pack
```

---

## ☁️ 1-Click Cloud Deployment (Render.com)

This application is ready for 24/7 continuous cloud hosting:

1. Create a free account on [Render.com](https://render.com).
2. Click **New +** ➔ **Web Service** and connect this repository (`yahiabinzaman/Teamworks.io`).
3. Set the following build settings (or let Render read `render.yaml` automatically):
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `node server/index.js`
   * **Plan**: `Free ($0/month)`
4. Click **Deploy Web Service** to receive your permanent HTTPS live URL.

---

## 👨‍💻 Author & Connect

**Yahia Bin Zaman (Yahia Mahmud)**

[![GitHub](https://img.shields.io/badge/GitHub-yahiabinzaman-181717?style=for-the-badge&logo=github)](https://github.com/yahiabinzaman)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Yahia%20Mahmud-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/yahiamahmud)
[![Behance](https://img.shields.io/badge/Behance-yahiamahmud-1769FF?style=for-the-badge&logo=behance)](https://behance.net/yahiamahmud)
[![Facebook](https://img.shields.io/badge/Facebook-YahiaBinZaman-1877F2?style=for-the-badge&logo=facebook)](https://facebook.com/YahiaBinZaman)
[![Instagram](https://img.shields.io/badge/Instagram-yahiabinzaman__official-E4405F?style=for-the-badge&logo=instagram)](https://instagram.com/yahiabinzaman_official)

* 🌐 **Website**: [yahiabinzaman.com](https://yahiabinzaman.com/)
* 🐙 **GitHub**: [@yahiabinzaman](https://github.com/yahiabinzaman)
* 💼 **LinkedIn**: [Yahia Mahmud](https://linkedin.com/in/yahiamahmud)
* 🎨 **Behance**: [yahiamahmud](https://behance.net/yahiamahmud)
* 📘 **Facebook**: [YahiaBinZaman](https://facebook.com/YahiaBinZaman)
* 📷 **Instagram**: [@yahiabinzaman_official](https://instagram.com/yahiabinzaman_official)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).