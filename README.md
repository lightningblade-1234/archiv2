# Mental Health Monitoring System - Architecture Implementation

A comprehensive mental health monitoring system with explicit assessment, confidence-weighted alerts, and continuous learning capabilities.

## Architecture Overview

This system implements 8 core solutions:

1. **Hybrid Assessment Model**: Tiered approach with passive monitoring, validated checkpoints, and contextual flags
2. **Confidence-Weighted Alert System**: Multi-dimensional risk profiles with confidence scores
3. **Sequential Analysis Architecture**: 5-stage checkpoint pipeline for message processing
4. **Proper C-SSRS Implementation**: Structured suicide risk assessment
5. **Contextual Emoji Understanding**: LLM-based emoji interpretation with personal baselines
6. **Adaptive Sensitivity**: Dynamic threshold adjustment with feedback loops
7. **Temporal Pattern Recognition**: Trajectory analysis and pattern detection
8. **Continuous Learning Infrastructure**: Feedback collection and performance monitoring

## Project Structure

```
archi/
├── app/
│   ├── core/              # Core configuration and utilities
│   ├── models/            # Database models
│   ├── schemas/           # Pydantic schemas
│   ├── services/          # Business logic
│   │   ├── assessment/    # Assessment services
│   │   ├── analysis/      # NLP and analysis services
│   │   ├── alerts/        # Alert system
│   │   └── learning/      # Continuous learning
│   ├── api/               # API endpoints
│   └── db/                # Database setup
├── tests/                 # Test suite
├── config/                # Configuration files
└── scripts/               # Utility scripts
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables (see `.env.example`)

   **For Local LLM (Recommended):**
   - Install Ollama: https://ollama.ai
   - Download a model: `ollama pull llama3`
   - Set `LLM_PROVIDER=local` in `.env`
   - See [LOCAL_LLM_SETUP.md](LOCAL_LLM_SETUP.md) for detailed instructions

   **For OpenAI:**
   - Set `LLM_PROVIDER=openai` in `.env`
   - Add your `OPENAI_API_KEY`

3. Initialize database:
```bash
alembic upgrade head
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

## Key Features

- **Explicit Assessment**: Uses validated instruments (PHQ-9, GAD-7, C-SSRS) instead of inference
- **Confidence Scoring**: Multi-dimensional risk profiles with confidence levels
- **Sequential Processing**: Safe, auditable message processing pipeline
- **Temporal Analysis**: Pattern recognition across time series data
- **Adaptive Learning**: System improves through counselor feedback
- **Clinical Validity**: Follows evidence-based protocols
- **Local LLM Support**: Use Ollama, LM Studio, or any OpenAI-compatible local LLM for privacy and cost savings

## License

Proprietary - Mental Health Monitoring System


"# mainarchi" 



NEW README
# 🏆 SIH Judge's Guide - Project Setup & Run Instructions Welcome to *MindCare - Mental Health Monitoring System. Follow these steps to set up and run the project on a local machine. ## 📋 Prerequisites Ensure the following are installed: 1. **Node.js: [Download](https://nodejs.org/) (Version 18+ recommended) 2. **Python: [Download](https://www.python.org/) (Version 3.10+ recommended) 3. **PostgreSQL: [Download](https://www.postgresql.org/) (Version 14+) 4. **Ollama: [Download](https://ollama.com/) (For local LLM support) --- ## 🛠 Step 1: Database Setup (PostgreSQL) 1. Open **pgAdmin* or your preferred SQL tool (or command line). 2. Create a designated user and database:
sql
    -- Run these SQL commands:
    CREATE USER postgres WITH PASSWORD 'admin';
    CREATE DATABASE sih;
    GRANT ALL PRIVILEGES ON DATABASE sih TO postgres;
(Note: If you already have a postgres user, just ensure the password matches or update the .env file later). --- ## 🤖 Step 2: Ollama (LLM) Setup 1. Install and launch *Ollama*. 2. Open a terminal and pull the required model (we use llama3.2 for speed/performance):
powershell
    ollama pull llama3.2
3. Ensure Ollama is running (it usually listens on port 11434). --- ## ⚙ Step 3: Backend Setup The backend is built with FastAPI. 1. Navigate to the backend directory:
powershell
    cd backend
2. Create and activate a virtual environment (optional but recommended):
powershell
    python -m venv venv
    .\venv\Scripts\activate
3. Install dependencies:
powershell
    pip install -r requirements.txt
4. *Configuration*: - Ensure a .env file exists in backend/ with the following (Create one if missing):
ini
      DATABASE_URL=postgresql://postgres:admin@localhost:5432/sih
      LLM_PROVIDER=local
      LOCAL_LLM_BASE_URL=http://localhost:11434/v1
      LOCAL_LLM_MODEL=llama3.2
      SECRET_KEY=your_secret_key
      ALGORITHM=HS256
      ACCESS_TOKEN_EXPIRE_MINUTES=30
(Update port 5432 if your Postgres runs on a different port). 5. *Run Migrations* (Create DB Tables):
powershell
    alembic upgrade head
If this fails, ensure the sih database exists. 6. *Start the Server*: We have provided a script to run it on all network interfaces (0.0.0.0):
powershell
    .\start_backend.bat
(Or manually: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000) --- ## 💻 Step 4: Frontend Setup The frontend is built with React + Vite. 1. Open a *new terminal*. 2. Navigate to the Frontend directory:
powershell
    cd Frontend
3. Install dependencies:
powershell
    npm install
4. *Start the Development Server*:
powershell
    npm run dev
The app will usually start at http://localhost:8081 (or similar). --- ## 🚀 Step 5: Running the Application 1. Open your browser and go to the Frontend URL (e.g., http://localhost:8081). 2. *Login Credentials: | Role | Email | Password | | :--- | :--- | :--- | | **Admin* | admin@gmail.com | admin | | *Student* | test@gmail.com | 12345 | | *Student* | ayush@gmail.com | 12345 | 3. *Core Features to Test: - **Student Dashboard: Wellness score, charts. - **AI Chatbot: Click "Chat with AI" and ask questions (uses local Ollama). - **Journaling: Add entries. - **Community: View posts and user profiles. - **Admin Panel: Manage users (login as Admin). --- ## ❓ Troubleshooting - **"Failed to fetch" Error: - Ensure Backend is running (start_backend.bat). - Ensure CORS allows your origin (we set it to * for easy testing). - Ensure Database credentials in .env match your local PostgreSQL. - **Chatbot not replying*: - Ensure Ollama is running (ollama serve). - Ensure you pulled the model (ollama pull llama3.2). Good Luck! 🌟 THIS IS THE README OF THE PROJECT