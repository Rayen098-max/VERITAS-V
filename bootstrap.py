#!/usr/bin/env python3
"""
VERITAS-V Automated One-Click Cross-Platform Bootstrap
Works on Windows, macOS, and Linux.
Automatically verifies prerequisites, dependencies, launches servers, and opens your browser.
"""

import os
import sys
import time
import shutil
import subprocess
import webbrowser
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
if (ROOT_DIR / "VERITAS-V" / "src" / "server" / "app.py").exists():
    PROJECT_DIR = ROOT_DIR / "VERITAS-V"
else:
    PROJECT_DIR = ROOT_DIR

os.chdir(PROJECT_DIR)

BANNER = r"""
========================================================================
           VERITAS-V: One-Click System Bootstrap & Launcher
   Video Evidence Real-Time Ingestion & Admissibility System (ESI-V)
========================================================================
"""

def print_step(num, title):
    print(f"\n[Step {num}] {title}...")

def check_python_version():
    if sys.version_info < (3, 10):
        print("[ERROR] VERITAS-V requires Python 3.10 or higher.")
        print(f"Current version: {sys.version.split()[0]}")
        sys.exit(1)
    print(f"  [OK] Python version: {sys.version.split()[0]}")

def check_system_ffmpeg():
    if shutil.which("ffmpeg"):
        print("  [OK] FFmpeg binary detected.")
    else:
        print("  [WARN] FFmpeg not found on system PATH.")
        print("         PySceneDetect and audio extraction rely on FFmpeg.")
        if sys.platform.startswith("win"):
            print("         -> To install on Windows: run 'winget install Gyan.FFmpeg'")
        elif sys.platform.startswith("darwin"):
            print("         -> To install on macOS: run 'brew install ffmpeg'")
        else:
            print("         -> To install on Linux: run 'sudo apt install ffmpeg'")
        print("         The system will proceed with available local tools.")

def ensure_env_file():
    env_file = PROJECT_DIR / ".env"
    env_example = PROJECT_DIR / ".env.example"
    if not env_file.exists():
        if env_example.exists():
            print("  [INFO] Creating .env file from .env.example...")
            shutil.copy(env_example, env_file)
            print("  [OK] Created .env (Pre-configured with free-tier fallbacks).")
        else:
            print("  [WARN] .env.example not found. Creating minimal .env...")
            with open(env_file, "w", encoding="utf-8") as f:
                f.write("CAPTIONING_BACKEND=veritas_local\nNARRATIVE_BACKEND=veritas_local\n")
    else:
        print("  [OK] .env configuration detected.")

def check_and_install_python_deps():
    try:
        import fastapi
        import uvicorn
        import scenedetect
        print("  [OK] Core Python libraries verified.")
    except ImportError:
        print("  [INFO] Missing core Python libraries. Installing from requirements.txt...")
        cmd = [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"]
        subprocess.check_call(cmd)
        print("  [OK] Python dependencies installed successfully.")

def check_and_install_node_deps():
    npm_bin = shutil.which("npm") or shutil.which("npm.cmd")
    if not npm_bin:
        print("  [WARN] Node.js/npm not found on PATH. Frontend may need to run in preview mode.")
        return

    node_modules = PROJECT_DIR / "node_modules"
    if not node_modules.exists():
        print("  [INFO] node_modules not found. Running 'npm install'...")
        subprocess.check_call([npm_bin, "install"], shell=(os.name == "nt"))
        print("  [OK] Frontend dependencies installed successfully.")
    else:
        print("  [OK] Frontend node_modules verified.")

def main():
    print(BANNER)

    print_step(1, "Verifying Environment & System Dependencies")
    check_python_version()
    check_system_ffmpeg()
    ensure_env_file()

    print_step(2, "Verifying Python Backend Packages")
    check_and_install_python_deps()

    print_step(3, "Verifying Frontend Node.js Packages")
    check_and_install_node_deps()

    print_step(4, "Starting Services")
    # Launch Backend
    print("  -> Launching FastAPI Backend Server on http://127.0.0.1:8000 ...")
    backend_cmd = [sys.executable, "-m", "uvicorn", "src.server.app:app", "--host", "127.0.0.1", "--port", "8000"]
    backend_proc = subprocess.Popen(backend_cmd, cwd=str(PROJECT_DIR))

    # Launch Frontend
    npm_bin = shutil.which("npm") or shutil.which("npm.cmd")
    frontend_proc = None
    if npm_bin:
        print("  -> Launching Vite React Frontend on http://localhost:5173 ...")
        frontend_cmd = [npm_bin, "run", "dev"]
        frontend_proc = subprocess.Popen(frontend_cmd, cwd=str(PROJECT_DIR), shell=(os.name == "nt"))
    else:
        print("  [WARN] Please start frontend manually using your package manager.")

    # Wait for servers
    print("\n[INFO] Waiting 4 seconds for servers to initialize...")
    time.sleep(4)

    frontend_url = "http://localhost:5173"
    print(f"\n[DONE] Opening VERITAS-V in your browser: {frontend_url}")
    webbrowser.open(frontend_url)

    print("\n" + "="*72)
    print("  VERITAS-V is now actively running!")
    print("  - Web Interface: http://localhost:5173")
    print("  - Backend API:   http://127.0.0.1:8000")
    print("  - Documentation: http://127.0.0.1:8000/docs")
    print("\n  Press Ctrl+C in this terminal at any time to shut down both servers.")
    print("="*72 + "\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down VERITAS-V servers...")
        if frontend_proc:
            frontend_proc.terminate()
        backend_proc.terminate()
        print("[OK] All servers stopped cleanly. Goodbye!")

if __name__ == "__main__":
    main()
