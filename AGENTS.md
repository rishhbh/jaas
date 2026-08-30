# RULES FOR AGENTS

This document contains mandatory operational rules and guidelines for AI agents working in this codebase.

---

## 1. Version Control & Git Operations

- **DO NOT commit or push code on your own**: Never execute `git commit`, `git push`, or alter remote repository state unless the user explicitly requests you to do so in the prompt.
- When requested to commit, construct clear, standard commit messages without fluff or uncontrolled auto-pushes.

---

## 2. Branding & Capitalization

- **Strict Brand Name**: The product name MUST ALWAYS be capitalized strictly as **`JaaS`**.
- **Forbidden Variations**: Never write `JAAS`, `jaas`, `Jaas`, `JaaS.ai`, or `JaaS.engine` in documentation, UI headers, comments, or user responses unless referencing a specific filesystem path (e.g., `client/public/jaas.png`).

---

## 3. UI & Design System (`client/DESIGN.md`)

- **Strict Alignment with `client/DESIGN.md`**: All UI components, pages, layout modifications, and CSS styling MUST strictly adhere to the guidelines established in [`client/DESIGN.md`](file:///mnt/FC8A80648A801D70/voidProjects/jaas/client/DESIGN.md).
- **Geometry & Borders**: Strictly **0px border-radius** (`rounded-none` everywhere). No rounded corners allowed.
- **Shadows**: Use hard-offset black geometric drop shadows (`shadow-[2px_2px_0px_#000]`, `shadow-[4px_4px_0px_#000]`). Never use soft blurred standard shadows (`shadow-md`, `shadow-lg`).
- **Typography**: Monospace (`font-mono` / `JetBrains Mono`), uppercase labels, bold tracking.
- **Colors**: High-contrast dark mode background (`#0a0a0c`), solid black borders (`#000000`), and neon/primary accent fills (`#FFEB3B`, `#2196F3`, `#FF5252`). No subtle gradients or pastel colors.

---

## 4. Communication & Output Rules

- **No Emojis**: Do not use emojis in UI elements, user responses, docstrings, commit messages, or comments unless explicitly instructed by the user.
- **Concise Responses**: Keep explanations brief, technical, and directly focused on the requested code changes.

---

## 5. Architecture & Code Integrity

- **Backend Runtime**: The server is built for the **Bun** runtime with Express (ES Modules). Ensure all imports and async patterns remain compatible.
- **Build Verification**: Run `npm run build` in `client/` after making non-trivial frontend changes to guarantee zero TypeScript or Next.js build errors.
- **Environment & Secrets**: Never hardcode API keys, secret tokens, or private credentials in code files. Maintain sync between `.env` and `.env.example`.
