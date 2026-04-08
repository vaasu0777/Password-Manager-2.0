# 🔐 Password Manager

<div align="center">

![Build](https://github.com/mrdcvlsc/password-manager/actions/workflows/build.yml/badge.svg)
![Tests](https://github.com/mrdcvlsc/password-manager/actions/workflows/tests.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?logo=fastify&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white)

**A full-stack web application to securely store and manage your passwords — with AES-256 encryption, session management, and a clean responsive UI.**

[🌐 Live Demo](https://password-manager-y140.onrender.com) • [📖 Cryptography Details](#-cryptography) • [🚀 Getting Started](#-getting-started)

</div>

---

## ✨ Features

- 🔑 **Secure password storage** — stored passwords are encrypted using AES-256-GCM
- 🧂 **Hashed user credentials** — user sign-in data is hashed with bcrypt
- 🗂️ **Organized vault** — store platform name, username, and password per entry
- 📱 **Responsive design** — works on both mobile and desktop
- 🍪 **Session management** — encrypted session keys via AES-256-GCM stored in SQLite
- ⚡ **Fast backend** — powered by Node.js and the Fastify web framework
- 🧪 **CI tested** — automated build and test pipelines via GitHub Actions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-----------|--------------------------------------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend | Node.js, Fastify |
| Database | SQLite3 via `better-sqlite3` |
| Sessions | `better-sqlite3` session store |
| Encryption | AES-256-GCM, SHA-256, bcrypt |
| CI/CD | GitHub Actions |
| Hosting | Render.com |

---

## 🔐 Cryptography

The application uses multiple layers of cryptographic protection to secure your data:

### `user` Table

| Column | Algorithm |
|--------|-----------|
| `uid` | None |
| `sign` (password) | `bcrypt` |

### `records` Table

| Column | Algorithm |
|----------|--------------------------------|
| `uid` | None |
| `username` | None |
| `platform` | None |
| `password` | SHA-256 + SPRStrG + AES-256-GCM |

### Session Encryption (on login)

| Requirement | Details |
|---------------------|--------------------------|
| Session IV | `SPRStrG` |
| Session key encryption | `AES-256-GCM` |
| `SESSION_KEY` source | `.env` file |

> See [`cryptography.md`](./cryptography.md) for the full technical breakdown.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v14 or higher
- npm

Then open your browser and go to: `http://localhost:3000`

> **⚠️ Important:** During local development, make sure the session cookie's `secure` property (line 52 in `app.js`) is set to `false`. This is required to enable login on non-HTTPS connections.

---

## 📁 Project Structure

```
password-manager/
├── public/              # Static frontend assets (Images)
├── .github/workflows/   # GitHub Actions CI pipelines
├── app.js               # App entry point & configuration
├── routes.js            # Route definitions
├── handler.js           # Route handlers / controllers
├── actions.js           # Business logic / action handlers
├── database.js          # Database setup and connection
├── statements.js        # Prepared SQL statements
├── crypto-scheme.js     # Cryptographic utilities
├── render.js            # Template rendering helpers
├── tests.js             # Automated tests
├── cryptography.md      # Cryptographic algorithm documentation
├── template.env         # Environment variable template
└── package.json         # Project metadata and scripts
```

---

## 🧪 Running Tests

```bash
npm test
```

Tests are also run automatically on every push via GitHub Actions.

---

## ☁️ Deployment

This application is ready for deployment on [Render.com](https://render.com).

1. Push your repository to GitHub.
2. Create a new **Web Service** on Render and connect your repo.
3. Set the required environment variables (`SESSION_KEY`, etc.) in the Render dashboard.
4. Render will auto-detect Node.js and deploy.

> **Note:** In production (HTTPS), ensure the `secure` cookie flag in `app.js` is set to `true`.

---

## ⚠️ Disclaimer

> This project was built with the intent to **learn full-stack web development** — it is **not intended to be a production-grade, enterprise-ready application**. There may be security vulnerabilities that have not been addressed. **Use at your own risk.** Do not store real, sensitive credentials in this application.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙌 Contributing

Contributions, issues, and feature requests are welcome! Feel free to:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

<div align="center">

Made with ❤️ by [Vaasu Gagneja](https://github.com/mrdcvlsc)

⭐ Star this repo if you found it helpful!

</div>
