<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=260&color=gradient&customColorList=12,20,24,30&text=PrepWise%20AI&fontAlignY=38&fontSize=58&desc=AI-Powered%20Mock%20Interview%20Platform&descAlignY=58"/>

# 🎙️ PrepWise AI Interviewer

### Practice Smarter. Interview Better. Get Hired Faster.

<p>

<img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=nextdotjs"/>

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react"/>

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript"/>

<img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss"/>

<img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase"/>

<img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge"/>

<img src="https://img.shields.io/badge/Groq-000000?style=for-the-badge"/>

<img src="https://img.shields.io/badge/Vapi_AI-7C3AED?style=for-the-badge"/>

</p>

</div>

---

# 🚀 Overview

PrepWise AI Interviewer is a next-generation interview preparation platform that leverages **Generative AI**, **Voice AI**, and **Resume Intelligence** to simulate realistic technical interviews.

Unlike traditional interview preparation websites, PrepWise provides a complete AI-driven interview experience—from resume analysis and personalized question generation to real-time voice conversations and intelligent performance feedback.

Whether you're preparing for software engineering, frontend, backend, or AI interviews, PrepWise helps you build confidence through realistic mock interviews powered by modern LLMs.

---

## ✨ Key Features

- 🎤 AI Voice Interview Experience
- 📄 Resume Upload & Analysis
- 🤖 Personalized AI Question Generation
- 🧠 Intelligent Interview Feedback
- 🔐 Secure Firebase Authentication
- 📊 Interview Dashboard
- 📝 Previous Interview History
- ⚡ Lightning Fast Next.js Application
- 📱 Fully Responsive Design
- ☁️ Firestore Database
- 🎯 Modern UI/UX
- 🚀 Production Ready Architecture

---
# 🏗️ System Architecture

```text
                         User
                           │
                           ▼
                Next.js Frontend (React)
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
 Firebase Auth     Resume Upload      Dashboard
          │                │                │
          └────────────┬───┴────────────────┘
                       ▼
                Resume Processing
                       │
               PDF Text Extraction
                       │
                       ▼
          Gemini + Groq AI Processing
                       │
        Personalized Interview Questions
                       │
                       ▼
               Vapi Voice AI Session
                       │
             Real-time Conversation
                       │
                       ▼
            AI Evaluation & Feedback
                       │
                       ▼
            Firestore Database Storage
```

---

# 🤖 AI Workflow

```text
Resume Upload
      │
      ▼
PDF Extraction
      │
      ▼
Resume Analysis
      │
      ▼
AI Question Generation
      │
      ▼
Voice Interview
      │
      ▼
Speech Processing
      │
      ▼
Performance Evaluation
      │
      ▼
Detailed Feedback
      │
      ▼
Dashboard History
```

---

# ⚙️ Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| AI Models | Gemini AI, Groq |
| Voice AI | Vapi AI |
| Resume Parsing | PDF Processing |
| Deployment | Vercel |

---

# 📂 Project Structure

```text
PrepWise-AI-Interviewer/
│
├── app/
│   ├── api/
│   ├── interview/
│   ├── resume/
│   └── auth/
│
├── components/
│
├── constants/
│
├── firebase/
│
├── lib/
│
├── public/
│
├── types/
│
└── README.md
```

---
# 💡 Why PrepWise?

Technical interviews can be challenging because candidates often lack access to realistic interview practice and personalized feedback. Traditional preparation platforms rely on static question banks that don't simulate real interview experiences.

**PrepWise AI** bridges this gap by combining **Generative AI**, **Voice AI**, and **Resume Intelligence** to create a personalized interview experience. Instead of simply displaying questions, PrepWise conducts interactive AI-driven interviews, adapts to the candidate's background, and provides actionable feedback for continuous improvement.

---

# 🌟 Real-World Use Cases

### 👨‍🎓 Students
- Practice before campus placements
- Improve communication and technical interview skills

### 💼 Job Seekers
- Prepare for software engineering interviews
- Build confidence through AI-powered mock interviews

### 🏢 Career Switchers
- Get personalized interview questions based on uploaded resumes
- Identify strengths and areas for improvement

### 🎯 Recruiters & Trainers
- Use as an interview practice platform
- Evaluate candidates through structured AI interviews

---

# 🔒 Security

PrepWise is designed with security and privacy in mind.

- 🔐 Firebase Authentication
- 🔒 Environment variables for API keys
- 🚫 Sensitive credentials excluded from Git
- 📄 Resume processing handled securely
- ☁️ Firestore security rules supported

---

# ⚡ Performance

- Next.js App Router
- Server-side rendering support
- Optimized API routes
- Responsive UI
- Lazy-loaded components
- Fast navigation
- Modern React architecture

---

# 📈 Future Roadmap

- [x] AI Voice Interviews
- [x] Resume Upload & Analysis
- [x] Personalized Interview Generation
- [x] AI Feedback Reports
- [x] Firebase Authentication
- [ ] Company-specific interview packs
- [ ] Coding interview mode
- [ ] Video interview support
- [ ] AI Career Coach
- [ ] ATS Resume Scoring
- [ ] Team mock interviews
- [ ] Multi-language support

---
# 🚀 Getting Started

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+
- npm or yarn
- Firebase Project
- Gemini API Key
- Groq API Key
- Vapi AI Account

---

## Installation

Clone the repository

```bash
git clone https://github.com/Rahul-Baghel01/PrepWise-AI-Interviewer.git
```

Go to the project

```bash
cd PrepWise-AI-Interviewer
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Visit

```
http://localhost:3000
```

---

# 🔑 Environment Variables

Create a `.env.local` file in the project root.

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# AI
GEMINI_API_KEY=
GROQ_API_KEY=

# Vapi
VAPI_API_KEY=
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
```

> **Important:** Never commit your `.env.local` file or API keys to GitHub.

---

# 📷 Screenshots

## Landing Page

> Add `landing.png`

---

## Resume Upload

> Add `resume.png`

---

## AI Voice Interview

> Add `interview.png`

---

## AI Feedback

> Add `feedback.png`

---

## Dashboard

> Add `dashboard.png`

---
# 🤝 Contributing

Contributions, feature requests, and suggestions are always welcome.

If you would like to improve PrepWise AI Interviewer:

1. Fork the repository
2. Create a new feature branch
3. Commit your changes
4. Push your branch
5. Open a Pull Request

Please ensure your code follows the existing project structure and coding style.

---

# 🛡️ License

This project is licensed under the **MIT License**.

See the LICENSE file for more information.

---

# 👨‍💻 Author

## Rahul Baghel

AI & Full Stack Developer

- GitHub: https://github.com/Rahul-Baghel01
- LinkedIn: https://www.linkedin.com/in/rahul-baghel-6694a9343/
- Email: rahulorai03@gmail.com

---

# ⭐ Support the Project

If you found this project useful:

⭐ Star the repository

🍴 Fork it

📢 Share it with others

Your support motivates further development.

---

# 🙏 Acknowledgements

Special thanks to the open-source community and the developers behind:

- Next.js
- React
- Firebase
- Tailwind CSS
- Vapi AI
- Google Gemini
- Groq

---

<div align="center">

## 🚀 Practice Smarter. Interview Better. Get Hired Faster.

Made with ❤️ by **Rahul Baghel**

</div>
