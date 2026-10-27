<div align="center">

# 🤝 CollabBase

### AI-Powered Developer Matchmaking Platform for Hackathons & Tech Events

*"Finding the right teammate should not be harder than winning the hackathon itself."*

![MERN](https://img.shields.io/badge/Stack-MERN-1976D2)
![React](https://img.shields.io/badge/React.js-0D47A1?logo=react&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Status](https://img.shields.io/badge/Status-In_Development-F5B041)

</div>

## 📌 Table of Contents
- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Research-Backed Design](#-research-backed-design)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Author](#-author)

## ❗ The Problem

Every technical event (a hackathon, an AI challenge, an innovation workshop) needs a well-rounded team to finish a project. But finding that team is still broken.

A strong frontend developer often can't find a backend or database developer before the event starts. This is the **skill-complementarity gap**, a well-documented problem in team-formation research.

**Why existing options fall short:**

| Platform | Limitation |
|---|---|
| LinkedIn | Built to showcase past achievements, not to find a teammate before an event |
| WhatsApp / Discord | Noisy, unsearchable, biased toward people who already know each other |
| College notice boards | Slow, informal, limited to one campus |

## 💡 The Solution

**CollabBase** is a MERN-stack platform that acts as a targeted, pre-competition staging ground. Developers post project ideas and the exact roles they need, then get matched intelligently, backed by **verified proof of work** instead of self-reported claims.

### Three core ideas

1. **Proof-of-Work Profiles (GitHub API):** Repositories, languages, and contribution history are pulled in automatically, replacing self-reported skill tags.
2. **AI Matching Engine (Gemini API + NLP):** Reads a plain-English post (e.g. *"building a food delivery app"*), extracts the implicit tech stack (React, Node, Maps API, Payments), then tags and routes the post to the right candidates.
3. **AI Icebreaker Generator:** Cross-references the team's required skills with an applicant's profile and drafts a personalized intro message, removing the "who messages first" friction.

## ✨ Key Features

- **Proof-of-Work Integration:** Top repos, languages, and contribution graph shown on the profile for instant vetting.
- **Reputation System (Vouches):** After an event, teammates vouch for each other (e.g. *"Great at meeting deadlines"*), building a track record that can't be faked.
- **Event Tags & Deadlines:** Posts tied to specific events with a live countdown (e.g. *"Team lock-in ends in 4 days"*).
- **Structured Swap Step:** AI suggests 2–3 profiles and both sides choose; it never auto-locks a team.
- **Compatibility Signals:** Timezone/availability, commitment level, and past hackathon count.
- **GitHub-Based Role Fit Score:** Matches backend/frontend heavy commit histories against the project's specific needs.
- **Vouches Feed Into Matching:** Reliable teammates surface higher in future searches.

## 🔬 Research-Backed Design

| Research Finding | What CollabBase Does |
|---|---|
| Pure algorithmic assignment causes dissatisfaction (Hevenstone et al., 2026) | AI suggests, humans choose; built-in swap step |
| Bottom-up teams outperform top-down teams (Vinella et al., *Frontiers in AI*, 2022) | Humans stay in control at every step |
| Skill survey + LLM requirement extraction + dynamic matching improves coverage (capstone study) | Same pipeline: user skills + AI-extracted tags + smart routing |
| New platforms fail from the cold-start problem (Flip case study) | Launch with one college / one hackathon circuit; reward early vouches |

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| AI Integration | `@google/generative-ai` (Gemini 1.5 Flash) |
| External APIs | GitHub REST API |

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Google AI Studio API key (Gemini)
- GitHub OAuth app / personal access token

### Installation

```bash
# 1. Clone the repository
git clone [https://github.com/nishikajn42/CollabBase.git](https://github.com/nishikajn42/CollabBase.git)
cd CollabBase

# 2. Install backend dependencies
cd backend
npm install

# 3. Install frontend dependencies
cd ../collabbase-landing
npm install