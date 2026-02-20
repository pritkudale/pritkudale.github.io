# Dangerous Dave Web Edition

A browser-playable, classic-style remake of the old Dangerous Dave platform game, built with HTML5 Canvas.

## Features

- Retro tile-based platform gameplay
- 3 handcrafted side-scrolling levels
- Enemies, spikes, falling hazards, and lives system
- Collectibles: trophies, key, gun, and jetpack fuel
- Shooting and simple enemy combat
- Locked exit door objective (collect trophies + key)
- Keyboard and touch controls
- GitHub Pages deployment workflow included

## Run locally

Use any static server from the project folder:

```bash
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

## Controls

- Move: `Arrow Left/Right` or `A/D`
- Jump / Climb: `Arrow Up` or `W` or `Space`
- Shoot: `F` or `K` (after collecting gun)
- Jetpack thrust: `Shift` (after collecting fuel)

## Objective

Collect all trophies, pick up the key, then reach the exit door while surviving enemies and hazards.

## Publish as a website (GitHub Pages)

This repo already includes `.github/workflows/deploy-pages.yml`.

1. Push this project to a GitHub repository on the `main` branch.
2. In that repo, open **Settings -> Pages**.
3. Set **Source** to `GitHub Actions`.
4. Push a commit to `main` (or run the workflow manually from **Actions**).
5. Your site will be published at:
   `https://<your-username>.github.io/<repo-name>/`

If you share your GitHub repo URL, I can also prepare the exact `git` commands and verify your Pages setup checklist.
