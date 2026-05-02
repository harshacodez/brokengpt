# BrokenGPT

**Chat with custom AI characters** — a full-stack AI chat platform where each conversation feels like a distinct persona, not a generic assistant.

<p align="center">
  <img src="demos/home.png" alt="BrokenGPT home — characters and navigation" width="100%" />
</p>

---

## What is BrokenGPT?

BrokenGPT is an AI chat product built around **characters**: curated personas (for example a **psychiatrist**, **librarian**, or **friend**) and **user-defined characters** with custom instructions, tone, and behaviour. You pick who you are talking to; the model stays in character while answering through **AWS Bedrock**.

The product uses a **credit (token) system**: new accounts receive a starting balance of free tokens. When credits run low, users can **purchase more** through the **PayPal** payment gateway, keeping hosting and model costs sustainable.

---

## Highlights

| Area | Description |
|------|-------------|
| **Predefined characters** | Ready-made roles so users can start chatting immediately with consistent personalities. |
| **Custom characters** | Define your own name, system prompt, and style so the AI behaves the way you want. |
| **Credits** | Token-based metering from sign-up through paid top-ups. |
| **Payments** | PayPal integration for buying credit packs after free allocation is used. |
| **Modern UI** | **React**, **Vite**, **TypeScript**, and **Tailwind CSS** for a fast, responsive client. |
| **Backend** | **Python** and **Flask** orchestrate auth, billing, character data, and calls to Bedrock. |

---

## Screenshots

All images below live in [`demos/`](demos/).

### Chat

Conversations stay scoped to the active character; the backend talks to **AWS Bedrock** for generation.

<p align="center">
  <img src="demos/chat.png" alt="BrokenGPT chat UI" width="800" />
</p>

### Credits and PayPal

Free tokens at sign-up, then **PayPal** when users need more capacity.

<p align="center">
  <img src="demos/credits.png" alt="BrokenGPT credits and PayPal billing" width="800" />
</p>

The **React** client talks to a **Flask** backend for sessions, characters, and credits; the API calls **AWS Bedrock** for model output and **PayPal** for purchases.

---

## Tech stack

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/AWS_Bedrock-232F3E?style=for-the-badge&logo=amazonaws&logoColor=white" alt="AWS Bedrock" />
  <img src="https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white" alt="PayPal" />
</p>

---

