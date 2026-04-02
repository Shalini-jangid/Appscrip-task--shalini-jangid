# Essence PLP - Premium Design Task

This is a state-of-the-art React SSR (Server-Side Rendering) Product Listing Page (PLP) built with Vite and Express.

## 🚀 Deployment Guide

This project is built with **Hybrid Architecture**. It works as a full Server-Side Rendered (SSR) app on Node.js platforms, but can fallback to a standard Single-Page App (SPA) on static hosts.

### 1. For Full SSR (Server Side Rendering - Best for SEO)
For the best experience (Pre-rendered content, dynamic meta tags), deploy to **Render.com**, **Railway**, or **Heroku**.
1.  Connect your GitHub repository.
2.  Build Command: `npm run build`
3.  Start Command: `npm run start`

### 2. For Static Hosting (GitHub Pages)
GitHub Pages only supports static files. SSR will not run there, but the app will still work!
1.  Run `npm run build` locally.
2.  Push the contents of the `dist/client` folder to a branch called `gh-pages`.

### 3. For Vercel
Vercel handles the included `vercel.json` and `server.js` automatically. Ensure your build settings are:
-   **Build Command**: `npm run build`
-   **Output Directory**: `dist/client` (or left default)
-   **Install Command**: `npm install`

## 🍱 Features
- **Manual Vite SSR**: Deep understanding of the React hydration cycle.
- **Premium Design**: Minimalist high-end "Essence" collection style.
- **Dynamic API**: Flexible data mapping (current source: Platzi API).
- **Responsive**: Fully optimized for Mobile, Tablet, and Desktop.
- **SEO Ready**: Dynamic meta tags, Schema.org ItemList integration, and clean heading hierarchy.
