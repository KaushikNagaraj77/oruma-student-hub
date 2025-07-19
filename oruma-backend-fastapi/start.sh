#!/bin/bash

# Oruma Student Hub Backend Startup Script

echo "🚀 Starting Oruma Student Hub Backend"
echo "======================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for Python
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.9+ and try again."
    exit 1
fi

# Check for PostgreSQL
if ! command_exists psql; then
    echo "⚠️  PostgreSQL client not found. Make sure PostgreSQL is installed."
fi

# Setup virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Setup environment file
if [ ! -f ".env" ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database settings before continuing."
    echo "   Minimum required: DATABASE_URL and JWT_SECRET_KEY"
    read -p "Press Enter when ready to continue..."
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/{posts,events,marketplace,avatars}

# Check database connection
echo "🗃️  Checking database connection..."
python3 -c "
try:
    from app.database import engine
    with engine.connect():
        print('✅ Database connection successful')
except Exception as e:
    print(f'❌ Database connection failed: {e}')
    print('💡 Make sure PostgreSQL is running and DATABASE_URL is correct in .env')
"

# Create database tables
echo "🏗️  Setting up database tables..."
python3 -c "
try:
    from app.database import create_tables
    create_tables()
    print('✅ Database tables created successfully')
except Exception as e:
    print(f'❌ Failed to create tables: {e}')
"

# Start the server
echo ""
echo "🎉 Starting development server..."
echo "🌐 API will be available at: http://localhost:3333"
echo "📖 Documentation at: http://localhost:3333/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start FastAPI server
uvicorn app.main:app --reload --port 3333 --log-level info