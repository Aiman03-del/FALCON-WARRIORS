<div align="center">

# 🦅 Falcon Warriors

**An esports tournament management platform** — track tournaments, matches, players, leaderboards, and news, all in one place.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-falcon--warriors.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://falcon-warriors.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Aiman03--del%2FFALCON--WARRIORS-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Aiman03-del/FALCON-WARRIORS)

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**[🔗 Live Site](https://falcon-warriors.vercel.app/)** · **[📦 Repository](https://github.com/Aiman03-del/FALCON-WARRIORS)**

</div>

---

## 📖 About

**Falcon Warriors** is a full-stack web app for organizing and following esports tournaments. It gives admins the tools to create tournaments, schedule matches, publish news, and manage players — while fans can browse leaderboards, rosters, and hall-of-fame awards like the Ballon d'Or.

## ✨ Features

- 🏆 **Tournaments** — create, manage, and browse tournaments
- ⚔️ **Matches** — schedule and track match results and fixtures
- 📰 **News** — publish and read the latest updates
- 👥 **Players** — full player roster and profiles
- 📊 **Leaderboards** — live rankings and standings
- 🥇 **Achievements & Ballon d'Or** — hall of fame and season awards
- 🔐 **Admin Dashboard** — protected admin workflows with:
  - Real-time form validation
  - Toast notifications (success / error / info / warning)
  - Confirmation dialogs for destructive actions
  - Skeleton loaders for a smooth loading experience
  - Empty states and breadcrumb navigation
- 🔍 **SEO-ready** — per-page metadata and OpenGraph tags
- 🖼️ **Image handling** via ImageKit
- 🗄️ **Auth & Database** via Supabase

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Backend / Auth / DB | [Supabase](https://supabase.com/) |
| Image CDN | [ImageKit](https://imagekit.io/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) project
- An [ImageKit](https://imagekit.io/) account

### Installation

```bash
# Clone the repository
git clone https://github.com/Aiman03-del/FALCON-WARRIORS.git
cd FALCON-WARRIORS

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
```

### Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app running locally.

## 📁 Project Structure

```
FALCON-WARRIORS/
├── app/           # Next.js app router — pages, components, API routes
├── public/        # Static assets (images, favicon, etc.)
├── scripts/       # Helper / utility scripts
├── .vscode/       # Editor settings
├── middleware.ts  # Auth / routing middleware
└── next.config.ts # Next.js configuration
```

## 🧭 Roadmap / Ideas for Contributors

- [ ] Add unit tests (Jest / Vitest) for validation utilities
- [ ] Add end-to-end tests (Playwright / Cypress)
- [ ] Set up GitHub Actions CI (lint + build on push)
- [ ] Add a `LICENSE` file
- [ ] Add dark/light theme toggle
- [ ] Add i18n support (English / বাংলা)
- [ ] Add pagination for large player/match lists

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Aiman03-del/FALCON-WARRIORS/issues).

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project currently has no license specified. Consider adding one (e.g., [MIT](https://choosealicense.com/licenses/mit/)) to clarify usage rights for others.

## 🔗 Links

- **Live Demo:** [https://falcon-warriors.vercel.app/](https://falcon-warriors.vercel.app/)
- **Repository:** [https://github.com/Aiman03-del/FALCON-WARRIORS](https://github.com/Aiman03-del/FALCON-WARRIORS)

---

<div align="center">
Made with 🦅 by <a href="https://github.com/Aiman03-del">Aiman03-del</a>
</div>