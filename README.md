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

---

## 1. **Use a Dynamic NPM Version Badge**

Add this markdown to your `README.md` (replace `tabulon` with your actual package name if different):

```markdown
![npm](https://img.shields.io/npm/v/tabulon)
```

Or, with a link to your npm page:

```markdown
<code_block_to_apply_changes_from>
```

- This badge is powered by [shields.io](https://shields.io/) and always shows the latest version published to npm.
- **No workflow or script is needed**—it updates automatically when you publish.

---

## 2. **How It Works**

- When you publish a new version to npm, the badge will update within a few minutes to reflect the new version.
- No manual or CI/CD step is required.

---

## 3. **Example**

Here’s how it might look in your README:

```markdown
# Tabulon

[![npm version](https://img.shields.io/npm/v/tabulon)](https://www.npmjs.com/package/tabulon)

A Playwright utility for interacting with and extracting structured data from HTML tables...
```

---

## 4. **Summary Table**

| What you want         | How to do it                                  | Manual? |
|---------------------- |-----------------------------------------------|---------|
| Show latest version   | Use shields.io npm badge in README            | No      |
| Update after release  | Badge updates automatically after npm publish | No      |

---

**You do not need to update the badge manually or with a script. Just use the shields.io badge!**

Let me know if you want badges for other things (downloads, build status, etc.) or need help with anything else!

