<<<<<<< HEAD
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

=======
>>>>>>> bd211712 (This one works. Simple cube displays, going to build from there.)
# Dawn with Tailwind CSS

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat&colorA=338fbb&colorB=1c1c1c&logoColor=ffffff)](https://github.com/odestry/.github/blob/main/CONTRIBUTING.md)
[![CI](https://img.shields.io/github/actions/workflow/status/odestry/dawn-with-tailwind/ci.yml?style=flat&label=CI&colorA=338fbb&colorB=1c1c1c&logoColor=ffffff)](https://github.com/odestry/dawn-with-tailwind/blob/main/.github/workflows/ci.yml)
[![Discord Shield](https://img.shields.io/discord/983602196493004820?style=flat&colorA=338fbb&colorB=1c1c1c&label=discord&logo=discord&logoColor=ffffff)](https://discord.gg/blanklob-community-983602196493004820)

[Video guide](#video-guide) |
[Usage](#usage) |
[Tools](#tools) |
[Contributing](#contributing) |
[About](#about) |
[License](#license)

## Video guide

<div align="center">
  <a href="https://youtu.be/TWA3ZFiTvsY">
    <img src="https://img.youtube.com/vi/TWA3ZFiTvsY/maxresdefault.jpg" alt="Watch the video" style="width:100%;">
  </a>
</div>

A simple example of Dawn Shopify reference theme working with Tailwind CSS with Vite as build tool.

## Usage

To get started clone the template by clicking the **Use this template** button or by running the following command:

```bash
git clone https://github.com/odestry/dawn-with-tailwind.git
```

### Running the development server

To run the development server, you'll need to have [Shopify CLI](#shopify-cli) as well as [Node.js](https://nodejs.org) installed on your machine.

1. Install the dependencies

```bash
npm install
```

2. Connect to your store

To connect your store update the `shopify.theme.toml` file with your store's information.

```toml
[environments.development]
store = "your-store-name.myshopify.com"
```

3. Start the development server

```bash
npm run dev
```

After authenticating, this will start a local development server running at `https://localhost:9292` that you can use to preview your changes.

## Tools

There are a number of really useful tools that the Shopify Themes team uses during development. This theme is already set up to work with these tools.

### Shopify CLI

[Shopify CLI](https://github.com/Shopify/shopify-cli) helps you build Shopify themes faster and is used to automate and enhance your local development workflow. It comes bundled with a suite of commands for developing Shopify themes—everything from working with themes on a Shopify store (e.g. creating, publishing, deleting themes) or launching a development server for local theme development.

You can follow this [quick start guide for theme developers](https://github.com/Shopify/shopify-cli#quick-start-guide-for-theme-developers) to get started.

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com) is a utility-first CSS framework for rapidly building custom storefront interfaces. It's a great way to build Shopify themes and sections quickly. You can find the configuration file at `tailwind.config.ts`. We use Vite to compile Tailwind CSS.

### Theme Check

We recommend using [Theme Check](https://github.com/shopify/theme-check) as a way to validate and lint your Shopify themes.

Theme Check is a command line tool that runs a series of tests against your theme code to surface errors, deprecations, and potential bugs. It's a great way to ensure your theme is up to date with the latest best practices and that you're not using any deprecated Liquid or JSON fields.

You can also run it from a terminal with the following Shopify CLI command:

```bash
shopify theme check
```

### Continuous Integration

This theme uses [GitHub Actions](https://github.com/features/actions) to maintain the quality of the theme. [This is a starting point](https://github.com/odestry/dawn-with-tailwind/blob/main/.github/workflows/ci.yml) and what we suggest to use in order to ensure you're building better themes. Feel free to build off of it!

#### Shopify/lighthouse-ci-action

We love fast websites! Which is why we created [Shopify/lighthouse-ci-action](https://github.com/Shopify/lighthouse-ci-action). This runs a series of [Google Lighthouse](https://developers.google.com/web/tools/lighthouse) audits for the home, product and collections pages on a store to ensure code that gets added doesn't degrade storefront performance over time.

#### Shopify/theme-check-action

This theme runs [Theme Check](https://github.com/Shopify/theme-check-action) on every commit via [Shopify/theme-check-action](https://github.com/Shopify/theme-check-action).

## Contributing

We'd love your help! Please read our [contributing guide](https://github.com/odestry/.github/blob/main/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements.

## About

Odestry isn't just a community; it's a group of dedicated folks all aiming to build better commerce together. Our mission is to create a supportive and open space where anyone, regardless of experience, can connect, learn, and grow. Here, you'll get inspired, have real talks, and find plenty of resources and open source tools to help you build. Whether you're looking to network, find opportunities, or just have meaningful conversations, join us and be part of a community that values authenticity, collaboration, and innovation. [Learn more](https://odestry.com).

## License

Copyright (c) 2024-present Odestry. See [LICENSE](/LICENSE.md) for further details.

Copyright (c) 2021-present Shopify Inc. See [LICENSE](/LICENSE.md) for further details.
<<<<<<< HEAD

Stay True Güüd 🍉
=======
>>>>>>> bd211712 (This one works. Simple cube displays, going to build from there.)
