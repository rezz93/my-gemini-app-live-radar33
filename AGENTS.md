# Persistent Agent Guidelines

- **GitHub Pages Compatibility**: Always ensure `vite.config.ts` includes `base: './'` so static assets resolve on GitHub Pages subpaths.
- **Lockfile & CI**: Keep `package-lock.json` and `.github/workflows/deploy.yml` updated for zero-configuration GitHub Pages deployments.
- **Favicon & Identity**: Maintain `/public/favicon.svg` and link tags in `index.html`.
