<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 3d63eee8 (� Synced project with correct GitHub remote)
# 🍉 WatermelonSeedV1 Starter Pack

> A Vue 3 + TroisJS + Tailwind Vite-powered Shopify theme add-on  
> Built for `nx40dr-bu.myshopify.com` using the Dawn theme  
> ✨ This is your base for injecting fully immersive 3D scenes with Shopify metafield integration.

---

## 📁 Folder Overview

```bash
WatermelonSeedV1_StarterPack/
├── README.md                # You're here
├── App.vue                  # Main app component
├── SplashScene.vue         # 3D splash screen using TroisJS
├── main.js                 # Vue app mount file
├── app.js                  # Shopify-injected script
├── theme.liquid            # Shopify layout file injection
├── vite.config.ts          # Vite config with correct build/output
├── tailwind.config.ts      # Tailwind setup
├── postcss.config.js       # Fix for Tailwind CSS PostCSS issues
├── package.json            # Dependencies
```

---

## 🧩 How To Use

### 1. 📂 Drop Files Into Shopify Theme

Upload these files into your Shopify Dawn theme repo:

| File | Target Path |
|------|-------------|
| `theme.liquid` | `layout/theme.liquid` |
| `app.js` | `assets/app.js` (after build) |
| `App.vue`, `SplashScene.vue`, `main.js` | `src/` (local dev only) |
| `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `package.json` | root of your local project |

---

## 🧪 Local Dev Workflow

```bash
# First time setup
npm install

# Build for Shopify
npm run build
```

After building, Shopify will load:
```
/assets/app.js
```

This is your compiled Vue app injected into `theme.liquid`.

---

## 🧠 How It Works

- `theme.liquid` contains:
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

- `main.js` mounts the Vue app to `#app`
- `App.vue` renders `<SplashScene />`
- `SplashScene.vue` uses TroisJS to create a 3D cube, lit, centered, and background colored
- Metafields are read and passed to props

---

## 🔧 Shopify Notes

- Only `assets/` is available to theme.js loads
- Vue source code is NOT bundled in Shopify—just the compiled `app.js`
- Use the `build` command before pushing to Shopify

---

## 🚀 Next Features To Plug In

✅ Basic cube rendered  
✅ Metafields loading  
⬜ Add spinning animation  
⬜ Add background shader  
⬜ Replace cube with GLTF seed model  
⬜ HUD for admin & in-scene controls  
⬜ CrystalSeed loader/injector system

---

## ❤️ Credits

- Built by [Patrick A. Wood - Nuwud Multimedia](https://nuwud.net)
- TroisJS + Vue 3 + Tailwind 4 + Vite
- Inspired by your dream of AI-powered 3D stores