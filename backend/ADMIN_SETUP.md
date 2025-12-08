# Admin User Setup Guide

## Step 1: Run Database Migration

First, apply the migration to add the `is_admin` field to the students table:

```powershell
cd backend
# Activate virtual environment if needed
..\venv\Scripts\Activate.ps1  # or use cmd: ..\venv\Scripts\activate.bat

# Run migration
alembic upgrade head
```

If you get PowerShell execution policy errors, use:
```cmd
cd backend
..\venv\Scripts\activate.bat
alembic upgrade head
```

## Step 2: Create Admin User

Run the script to create the admin user:

```powershell
cd backend
python scripts/create_admin_user.py
```

Or using cmd:
```cmd
cd backend
python scripts\create_admin_user.py
```

This will create an admin user with:
- **Email:** admin@gmail.com
- **Password:** admin
- **Student ID:** admin_001

## Step 3: Verify

You can verify the admin user was created by checking the database or trying to log in at `/admin-login`.

## Starting the Backend

To start the backend server:

```powershell
cd backend
# Activate virtual environment
..\venv\Scripts\Activate.ps1  # or use cmd: ..\venv\Scripts\activate.bat

# Start server
uvicorn app.main:app --reload
```

The server will run on `http://127.0.0.1:8000`

If you get PowerShell execution policy errors, use cmd instead:
```cmd
cd backend
..\venv\Scripts\activate.bat
uvicorn app.main:app --reload
```



