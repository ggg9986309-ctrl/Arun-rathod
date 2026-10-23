# ARUN RATHOD — animated portfolio website

A responsive, dark, hacker/cyber-inspired personal portfolio with animated scanlines, grid, cursor glow, scroll reveals, photo lightbox, mobile navigation, Instagram link, and a protected admin editor.

## Files

All main project files are together in this root folder. The two supplied photos (`arun-main.jpeg` and `arun-gallery.jpeg`) are in the same root folder as all other files. No assets subfolder is needed.

- `index.html` — public website
- `style.css` — visual design and animations
- `app.js` — menu, reveals, gallery lightbox and content loading
- `admin.html`, `admin.css`, `admin.js` — admin login and content editor
- `server.js` — Node/Express API and static website server
- `data.json` — initial public content
- `.env.example` — environment variable template (never use as a real secret file)
- `package.json` — start script and dependencies

## Run locally

Install Node.js 20 or newer, then run from this folder:

```bash
npm install
```

Set environment variables from `.env.example` in your terminal/hosting settings. Do not commit real passwords or JWT secrets to GitHub. Then run:

```bash
npm start
```

Open `http://localhost:3000` for the site and `http://localhost:3000/admin.html` for the admin console.

## Configure two admins securely

Set all of these in your hosting provider's **Environment Variables** settings:

- `JWT_SECRET` — long random value, at least 32 characters
- `ADMIN1_USERNAME`, `ADMIN1_PASSWORD`
- `ADMIN2_USERNAME`, `ADMIN2_PASSWORD`

Use different strong passwords for the two admins. No passwords are prefilled in this project. The server rate-limits login attempts and issues short-lived JWT sessions. Always use HTTPS in production.

## Make it public/live

This project is **ready to deploy**, but it has not been published to a hosting account by this ZIP. To make it live, upload the folder to a Node.js host that supports `npm install` and `npm start`, set the environment variables above, and deploy. A custom domain is optional. A static-only host such as GitHub Pages cannot run this admin API.

### Important persistence note

The editor writes to `data.json`. Some free Node hosting services use an ephemeral/read-only filesystem, which can discard changes on restart or redeploy. For reliable production editing, attach a persistent disk or replace the JSON store with a hosted database. Do not claim that admin edits persist until you verify it on the chosen host.

## Content check

The page uses only the details supplied for this project. Please verify the education/location wording and photo choices before publishing. The site does not invent a phone number, email address, or other private contact details.
