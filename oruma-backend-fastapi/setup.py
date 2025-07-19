#!/usr/bin/env python3
"""
Setup script for Oruma Student Hub Backend
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path


def run_command(command, description=""):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(f"✅ {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e.stderr}")
        return False


def check_python_version():
    """Check if Python version is 3.9+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print("❌ Python 3.9+ is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True


def setup_virtual_environment():
    """Create and setup virtual environment"""
    if not os.path.exists("venv"):
        print("📦 Creating virtual environment...")
        if not run_command("python -m venv venv", "Creating virtual environment"):
            return False
    else:
        print("✅ Virtual environment already exists")
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = "venv\\Scripts\\activate"
        pip_cmd = "venv\\Scripts\\pip"
    else:  # Unix/Linux/MacOS
        activate_script = "venv/bin/activate"
        pip_cmd = "venv/bin/pip"
    
    # Install dependencies
    print("📦 Installing dependencies...")
    if not run_command(f"{pip_cmd} install --upgrade pip", "Upgrading pip"):
        return False
    
    if not run_command(f"{pip_cmd} install -r requirements.txt", "Installing requirements"):
        return False
    
    return True


def setup_environment_file():
    """Setup environment configuration"""
    if not os.path.exists(".env"):
        print("🔧 Creating environment file...")
        shutil.copy(".env.example", ".env")
        print("✅ Created .env file (please edit with your settings)")
        return True
    else:
        print("✅ Environment file already exists")
        return True


def create_upload_directories():
    """Create upload directories"""
    directories = ["uploads", "uploads/posts", "uploads/events", "uploads/marketplace", "uploads/avatars"]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
    
    print("✅ Created upload directories")
    return True


def check_database_connection():
    """Check if database connection works"""
    try:
        from app.config import settings
        from app.database import engine
        
        # Try to connect
        with engine.connect() as conn:
            print("✅ Database connection successful")
            return True
    except ImportError:
        print("⚠️  Cannot test database connection (dependencies not installed yet)")
        return True
    except Exception as e:
        print(f"⚠️  Database connection failed: {e}")
        print("💡 Make sure PostgreSQL is running and check your DATABASE_URL in .env")
        return False


def setup_database():
    """Setup database tables"""
    try:
        print("🗃️  Setting up database tables...")
        from app.database import create_tables
        create_tables()
        print("✅ Database tables created")
        return True
    except ImportError:
        print("⚠️  Cannot setup database (run this after installing dependencies)")
        return True
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        return False


def main():
    """Main setup function"""
    print("🚀 Setting up Oruma Student Hub Backend")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Setup virtual environment
    if not setup_virtual_environment():
        print("❌ Failed to setup virtual environment")
        sys.exit(1)
    
    # Setup environment file
    if not setup_environment_file():
        print("❌ Failed to setup environment file")
        sys.exit(1)
    
    # Create upload directories
    if not create_upload_directories():
        print("❌ Failed to create upload directories")
        sys.exit(1)
    
    # Check database connection
    check_database_connection()
    
    print("\n🎉 Setup completed!")
    print("\n📋 Next steps:")
    print("1. Edit .env file with your database URL and JWT secret")
    print("2. Make sure PostgreSQL is running")
    print("3. Activate virtual environment:")
    
    if os.name == 'nt':
        print("   venv\\Scripts\\activate")
    else:
        print("   source venv/bin/activate")
    
    print("4. Run the development server:")
    print("   uvicorn app.main:app --reload --port 3333")
    print("\n🌐 API will be available at: http://localhost:3333")
    print("📖 Documentation at: http://localhost:3333/docs")


if __name__ == "__main__":
    main()