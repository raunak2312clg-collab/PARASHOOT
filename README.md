# Parashoot Studio — React + Node.js conversion

This project reproduces the supplied Parashoot Studio website using **React 18**, **Vite**, and **Node.js/Express** while preserving the original page markup, CSS, animations, forms, galleries, lightboxes, and media paths.

## Important: assets are intentionally excluded

The original media library is hundreds of megabytes, so it is **not duplicated inside this source ZIP**.

After extracting this React project:

1. Open your **original Parashoot Studio project**.
2. Copy the entire original `assets` folder.
3. Paste it into:

   `parashootstudio-react/public/assets/`

The result must look like:

```text
parashootstudio-react/
├─ public/
│  └─ assets/
│     ├─ ...original folders/files...
├─ src/
├─ server/
├─ package.json
└─ ...
```

Do **not** rename or reorganize the asset files. The React conversion keeps the original paths intentionally so it can use the same media library without duplication.

## Run locally

Requirements: Node.js 18+ and npm.

```bash
npm install
npm run dev
```

Open:

`http://localhost:5173`

Development mode runs:
- React/Vite on port `5173`
- Node/Express API on port `3001`

## Production build

```bash
npm run build
npm start
```

Open:

`http://localhost:3000`

## Original URLs preserved

The existing links continue to work:

- `/index.html`
- `/about.html`
- `/services.html`
- `/work.html`
- `/portfolio.html`
- `/advideo.html`
- `/careers.html`
- `/connect.html`

Clean aliases such as `/about`, `/work`, `/portfolio`, and `/connect` are also supported.

## How the conversion stays visually identical

The eight supplied HTML pages are retained under `src/original-pages/`. A React runtime component mounts each page into the React application, injects that page's original CSS/font links, and runs its original JavaScript in page order. This avoids unnecessary visual or behavioral changes while still making React the application entry point and Node/Express the production server.

## Forms

The conversion intentionally preserves the existing form behavior exactly as supplied:

- Careers keeps its original Web3Forms submission behavior.
- Connect keeps its original front-end submit/success behavior.

No form logic was silently changed during the React conversion.


## Added pages

- `/team.html` — dedicated Parashoot Studio team page using the existing team images in `assets/images/about/team/`.
- `/clients.html` — dedicated client/collaborator page using the existing sponsor logos in `assets/images/sponsors/`.
- Navigation label updated from `About` to `About Studio` across desktop and mobile menus.

No media assets are included in this source package; continue to copy your original `assets` folder into `public/assets/`.
