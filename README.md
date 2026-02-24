# 🎨 TextToVisual AI Suite v2.0

> A high-performance, modern AI visual platform that transforms text into cinematic imagery and intelligent system diagrams.
--
## ✨ Overview

**TextToVisual AI Suite** is a dual-purpose application designed for creative and technical workflows. It leverages state-of-the-art AI models to provide two primary capabilities:
1.  **AI Image Generation**: Transforms descriptive text into high-fidelity, cinematic images using the FLUX.1 model.
2.  **AI Diagram Generation**: Converts system descriptions or logic into structured Mermaid.js flowcharts instantly.

By integrating **Google Gemini**, the suite automatically enhances user prompts to ensure the highest quality output without requiring advanced "prompt engineering."

---

## 🚀 Core Features

-   **🧠 Intelligent Prompt Enhancement**: Uses **Google Gemini 1.5 Flash** to rewrite and expand simple prompts into detailed, cinematic instructions.
-   **🖼️ Professional Image Generation**: Powered by **FLUX.1-schnell** via HuggingFace Inference API for ultra-realistic and rapid generation.
-   **📊 Instant Diagram Creation**: Describe a system or flow, and let AI generate the **Mermaid.js** code and render it live.
-   **☁️ Persistent Cloud History**: Seamlessly integrated with **Firebase Firestore** to save, browse, and manage your past creations.
-   **🎨 Premium Dark UI**: Features a sleek, responsive design with glassmorphism, smooth CSS animations, and intuitive tabbed navigation.
-   **📥 High-Quality Downloads**: Export your generated images and diagrams directly to your device with one click.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS (Glassmorphism & Custom Animations)
- **Icons**: Lucide React
- **Diagrams**: Mermaid.js
- **Backend Communication**: Axios
- **State & Database**: Firebase Firestore & SDK

### **Backend**
- **Runtime**: Node.js & Express
- **AI Engine 1**: Google Generative AI (Gemini 1.5 Flash)
- **AI Engine 2**: HuggingFace Inference (FLUX.1-schnell model)
- **Security**: Rate limiting via `express-rate-limit`
- **Environment**: Dotenv for secure key management

---

## 📂 Project Structure

```text
text-to-visual-ai/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # UI Components
│   │   ├── firebase.js # Firebase initialization
│   │   └── App.jsx     # Main application logic
├── backend/            # Express.js server
│   ├── index.js        # Server entry & AI logic
│   └── .env            # Private API keys
└── package.json        # Root scripts for development
```

---

## 📦 Setup & Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/text-to-visual-ai.git
cd text-to-visual-ai
```

### **2. Environment Configuration**

**Backend Setup:**
Navigate to `backend/`, create a `.env` file:
```env
GEMINI_API_KEY=your_google_gemini_key
HUGGINGFACE_API_KEY=your_hf_access_token
PORT=3000
```

**Frontend Setup:**
Ensure your Firebase configuration is correctly set in `frontend/src/firebase.js`.

### **3. Install & Run**

From the **root directory**, you can run both frontend and backend concurrently:

```bash
# Install all dependencies (Frontend, Backend, and Root)
npm run install:all

# Start both servers together
npm run dev
```
