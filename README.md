# 🏆 Online Judge Platform

A professional competitive programming platform where users can solve coding challenges, participate in contests, and compete with others.

## ✨ Features

### 🎯 For Contestants
- 💻 **Code Editor**: Monaco Editor with C++ and Python support
- 🌐 **Multi-language**: Automatic translation (English/Arabic)
- 📊 **User Profiles**: Personal statistics and solved problems
- 🏅 **Rating System**: Elo-based rating that updates after each contest
- 📈 **Global Leaderboard**: Compete with top problem solvers
- ⏱️ **Instant Judging**: Get immediate feedback with detailed test results

### 🏆 Contests
- 📅 **Official Contests**: Timed competitions with leaderboards
- 🕐 **Virtual Contests**: Participate in past contests anytime
- 🎖️ **ICPC Scoring**: Score + penalty system
- 📊 **Contest Leaderboards**: Real-time rankings

### 👨‍💼 For Admins
- ➕ **Problem Management**: Create, edit, delete problems
- 🧪 **Test Cases**: Add hidden and visible test cases
- 🏆 **Contest Management**: Create contests and add problems
- 🌐 **Auto Translation**: Machine translation to Arabic

### 🔒 Security
- 🔐 **JWT Authentication**: Secure login with role-based access
- 🐳 **Docker Sandbox**: Code execution in isolated containers
- 🚫 **Network Isolation**: No internet access for submitted code
- 💾 **Memory & Time Limits**: Prevent resource abuse

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Monaco Editor |
| **Backend** | Node.js, Express 5 |
| **Database** | PostgreSQL with Prisma ORM |
| **Queue** | Redis + BullMQ |
| **Execution** | Docker containers (gcc, Python) |
| **Auth** | JWT + bcrypt |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop
- PostgreSQL
- Redis

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/online-judge-platform.git
cd online-judge-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
# Create .env file (see Environment Variables section)
npx prisma migrate dev
npx prisma generate
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install
npm run dev
```

4. **Run Judge Worker**
```bash
cd backend
npm run worker
```

5. **Start Redis**
```bash
docker run -d --name redis-server -p 6379:6379 redis:latest
```

### Environment Variables

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/online_judge"
JWT_SECRET="your-secret-key-here"
PORT=5000
```

## 🎓 Project Structure

```
online-judge-platform/
├── backend/              # Node.js Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── workers/      # Judge worker
│   └── prisma/           # Database schema
├── frontend/             # React application
│   └── src/
│       ├── pages/
│       ├── components/
│       └── context/
└── README.md
```

## 👥 Authors

- **Amer Abu Arab** - [GitHub Profile](https://github.com/amerabuarab441-max)

---

Made with ❤️ for competitive programmers