# Starting the Backend Server

## Quick Start

From the **backend/** directory, run:

```powershell
uvicorn app.main:app --reload
```

Or from the project root:

```powershell
cd backend
uvicorn app.main:app --reload
```

## Why?

The `app` module is located in `backend/app/`, so you need to run uvicorn from the `backend/` directory for Python to find it.

## Server URL

Once started, the server will be available at:
- **http://127.0.0.1:8000**
- **http://localhost:8000**

## API Documentation

After starting, visit:
- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc


