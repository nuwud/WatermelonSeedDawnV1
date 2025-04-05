# 🍉 WatermelonSeedDawnV1 Starter Kit

> Vue 3 + TroisJS + TailwindCSS 4 + Vite\
> Integrated with Shopify’s Dawn Theme\
> Injects immersive 3D modules and supports metafields for dynamic control.

---

## 📁 Folder Structure

```
WatermelonSeedDawnV1/
├── modules/                        # Modular 3D features go here
│   └── SplashScene.vue            # First modular 3D scene (spinning cube)
│   └── futureScene.vue            # (e.g. GLTF models, sky shaders, etc.)
├── src/
│   ├── App.vue                    # Main Vue app – renders <SplashScene />
│   └── main.js                   # Mounts App.vue to #app
├── assets/
│   └── app.js                     # Compiled app injected into Shopify
├── layout/
│   └── theme.liquid               # Vue mount + metafield injection
├── postcss.config.js             # Tailwind/PostCSS glue
├── tailwind.config.ts            # TailwindCSS v4 setup
├── vite.config.ts                # Vite build optimized for Shopify
├── package.json                  # Project dependencies
└── README.md                     # You’re here
```

---

## 🚀 Setup Instructions

### 🔧 1. Install

```bash
npm install
```

### 🔨 2. Build

```bash
npm run build
```

This generates `/assets/app.js` — the compiled Vue+Trois 3D app.

### ℹ️ 3. Push to Shopify

```bash
shopify theme push
```

---

## 💡 How It Works

- `theme.liquid` injects:

```liquid
<script id="metafields" type="application/json">
  {
    "rotation_speed": {{ product.metafields.custom.rotation_speed | json }},
    "bg_color": {{ product.metafields.custom.bg_color | json }},
    "seed_model_url": {{ product.metafields.custom.seed_model_url | json }}
  }
</script>
<div id="app"></div>
<script type="module" src="/assets/app.js?v={{ 'now' | date: "%s" }}"></script>
```

- Vue app mounts to `#app`, and loads your 3D scene from `modules/SplashScene.vue`.
- Metafields (if set in Shopify) get pulled in via DOM bridge and passed as props.

---

## 🧹 Modular 3D Pattern

Want to add more scenes or features?

Just drop new Vue components inside `/modules/` and import them in `App.vue`. For example:

```vue
<script setup>
import SplashScene from './modules/SplashScene.vue'
</script>

<template>
  <SplashScene />
</template>
```

This keeps `App.vue` minimal and lets you test each feature independently.

---

## 📦 Shopify Theme Notes

- You can’t use `src/` files directly in Shopify – only the compiled output in `assets/`.
- Always `npm run build` before pushing.
- Keep metafields set in the product editor to see dynamic effects.

---

## ✅ Features Implemented

- ✅ Vue 3 + TroisJS scaffold
- ✅ Shopify metafield bridge via `<script id="metafields">`
- ✅ Working 3D canvas + lighting + cube
- ✅ Modular file system via `modules/`
- ✅ GitHub + Vite + Tailwind configured
- ✅ Fullscreen, zero-margin rendering

---

## 🧪 Up Next: Future Features

- ⏳ Replace cube with GLTF model (`seed_model_url`)
- 🎨 Add iridescent background shader
- 🛒 Add basic Shopify HUD controls (Add to cart, Variants, etc)
- 🧠 HUD interface & AI Crystal Seed menu
- ⚙️ Admin toggle interface for customizing scene
- ⚙️ Size, rotation, animation metadata from metafields

---

## 🏆 Author & Credits

- Built by [Patrick A. Wood – Nuwud Multimedia](https://nuwud.net)
- GitHub Repo: [WatermelonSeedDawnV1](https://github.com/nuwud/WatermelonSeedDawnV1)
- Technologies: Vue 3, TroisJS, TailwindCSS 4, Vite, Shopify Dawn

---

## 🍉 Final Notes

- ❤️ Motto: **“Make it happen”** — from Patrick’s Dad
- 🌱 This is the beginning of something huge. Stay modular, stay creative, and protect the seed.