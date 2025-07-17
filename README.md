# Tabulon

[![npm version](https://img.shields.io/npm/v/tabulon)](https://www.npmjs.com/package/tabulon)


> ⚡ A lightweight utility for interacting with HTML tables in [Playwright](https://playwright.dev) using logical selectors instead of brittle CSS chains.

---

## ✨ Why Tabulon?

HTML tables can be a pain to automate:

- Rows move around
- Column orders change
- Selectors like `tbody > tr:nth-child(3) > td:nth-child(5)` are fragile

**Tabulon** solves this by treating tables like structured data:

- Access cells by **column headers** or **row content**
- Extract the entire table as structured **JSON**
- Click buttons or fill fields inside any **row/cell**
- Write clean, readable Playwright tests

---

## 📦 Installation

```bash
pnpm add tabulon
# or
npm install tabulon
# or
yarn add tabulon
```
