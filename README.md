# 🎨 CV-Connect Frontend

<div align="center">

![React](https://img.shields.io/badge/React-19+-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.0+-purple?style=for-the-badge&logo=vite)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8+-black?style=for-the-badge&logo=socket.io)
![Axios](https://img.shields.io/badge/Axios-1.10+-green?style=for-the-badge&logo=axios)

**Modern web application for CV-Connect freelance platform**
<br>
Real-time features, responsive design, seamless user experience
<br>
<br>

[📖 Documentation](#-overview) •
[🚀 Quick Start](#-quick-start) •
[🎨 Components](#-features) •
[🛠️ Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

CV-Connect Frontend is a modern React application that provides an intuitive interface for freelancers and companies to connect, collaborate, and manage projects. Built with modern React patterns and real-time capabilities.

### 🎯 Key Features
- **🎨 Modern UI/UX** - Clean, responsive design
- **👥 Multi-Role Dashboard** - Tailored experiences for different user types
- **💬 Real-time Messaging** - Live chat with typing indicators
- **📄 CV Management** - Upload and manage professional documents
- **🤝 Smart Matching** - Intelligent freelancer-company compatibility
- **📊 Analytics Dashboard** - Real-time insights and trends
- **📱 Mobile-Responsive** - Optimized for all screen sizes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Modern web browser

### Installation
```bash
# Clone and install
git clone https://github.com/1Mhondiwa/cv-connect-frontend.git
cd cv-connect-frontend
npm install

# Setup environment
cp .env.example .env
# Edit .env with your API URL

# Start development
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

---

## 🎨 Features

### User Dashboards
- **Freelancer Dashboard** - Profile management, job recommendations, messaging
- **Associate Dashboard** - Talent search, job postings, interview scheduling
- **Admin Dashboard** - User management, analytics, system health

### Real-time Features
- Live messaging with Socket.io
- Real-time notifications
- Typing indicators and read receipts
- Instant updates across all connected clients

### CV Management
- Multi-format upload support (PDF, DOCX, TXT)
- Real-time preview
- Skill extraction and validation
- Portfolio integration

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite
- **Routing**: React Router DOM
- **State Management**: React Context, Hooks
- **HTTP Client**: Axios
- **Real-time**: Socket.io Client
- **Styling**: CSS, Responsive Design
- **Build Tools**: Vite, ESLint

---

## 🏗️ Architecture

```
┌─────────────────┐
│   React App     │
│                 │
├─────────────────┤
│   Components    │
│   Pages         │
│   Hooks         │
│   Utils         │
├─────────────────┤
│   Socket.io     │
│   Axios         │
│   React Router  │
└─────────────────┘
         │
    ┌─────────┐
    │   API   │
    └─────────┘
```

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile-First Approach
- Touch-friendly interfaces
- Optimized navigation
- Gesture support
- Offline capabilities

---

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=https://your-api-url.com/api
VITE_SOCKET_URL=https://your-api-url.com
VITE_APP_NAME=CV-Connect
```

---

## 📊 Performance

- **First Contentful Paint**: <1.5s
- **Largest Contentful Paint**: <2.5s
- **Bundle Size**: <500KB (gzipped)
- **Performance Score**: 95/100

---

## 🧹 Code Quality

### Linting

```bash
# Check for lint errors (fails on any warning)
npm run lint        # eslint . --max-warnings 0

# Auto-fix
npx eslint . --fix --max-warnings 0
```

- `eslint` flat config at `eslint.config.js` (React hooks + `react-refresh`, `no-unused-vars` as error)
- Husky pre-commit runs `lint-staged` (`eslint --fix --max-warnings 0` on `*.{js,jsx}`) — commit is blocked on any warning
- CI `.github/workflows/ci.yml` runs `npm run lint` — PRs with warnings fail

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run coverage
npm run test:coverage
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker Deployment
```bash
docker build -t cv-connect-frontend .
docker run -p 3000:80 cv-connect-frontend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ using modern React patterns**

[🔝 Back to top](#-cv-connect-frontend)

</div>
