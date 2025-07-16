from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import math
import json
import os

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:8000",
    "http://localhost:5502",
    "http://127.0.0.1:5502",
    "null",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CPUMemoryTrack(BaseModel):
    track_cm: bool = False
    track_intr: int = 1

class Track(BaseModel):
    usage: bool = False
    location: bool = False
    cpu_memory: CPUMemoryTrack

class Application(BaseModel):
    app_name: str
    app_type: str
    current_version: str
    released_date: str
    publisher: str
    description: Optional[str] = ""
    download_link: Optional[str] = ""
    enable_tracking: bool = False
    track: Track
    registered_date: str

class ApplicationResponse(BaseModel):
    id: int
    app_name: str
    app_type: str
    current_version: str
    released_date: str
    publisher: str
    description: Optional[str] = ""
    download_link: Optional[str] = ""
    enable_tracking: bool = False
    track: Track
    registered_date: str

class PaginatedResponse(BaseModel):
    applications: List[ApplicationResponse]
    total: int
    page: int
    pages: int

# JSON file storage configuration
DATA_FILE = "data/applications.json"

def load_data_from_file():
    """Load applications data from JSON file"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                return data.get('applications', []), data.get('next_id', 1)
        else:
            # Return default data if file doesn't exist
            return get_default_data(), 13
    except Exception as e:
        print(f"Error loading data from file: {e}")
        return get_default_data(), 13

def save_data_to_file(applications, next_id):
    """Save applications data to JSON file"""
    try:
        # Create data directory if it doesn't exist
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        
        data = {
            "applications": applications,
            "next_id": next_id
        }
        
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
            
        print(f"Data saved to {DATA_FILE}")
    except Exception as e:
        print(f"Error saving data to file: {e}")

def get_default_data():
    """Get default application data"""
    return [
    {
        "id": 1,
        "app_name": "Notepad",
        "app_type": "windows",
        "current_version": "1.0.0",
        "publisher": "Microsoft",
        "released_date": "2025-01-01",
        "description": "Simple text editor",
        "download_link": "https://microsoft.com/notepad",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2025-01-01"
    },
    {
        "id": 2,
        "app_name": "Calculator",
        "app_type": "windows",
        "current_version": "2.1.0",
        "publisher": "Microsoft",
        "released_date": "2024-12-15",
        "description": "Basic calculator app",
        "download_link": "https://microsoft.com/calculator",
        "enable_tracking": False,
        "track": {
            "usage": False,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-12-15"
    },
    {
        "id": 3,
        "app_name": "Chrome",
        "app_type": "web",
        "current_version": "120.0.0",
        "publisher": "Google",
        "released_date": "2024-11-20",
        "description": "Web browser",
        "download_link": "https://google.com/chrome",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": True,
            "cpu_memory": {
                "track_cm": True,
                "track_intr": 5
            }
        },
        "registered_date": "2024-11-20"
    },
    {
        "id": 4,
        "app_name": "VS Code",
        "app_type": "windows",
        "current_version": "1.85.0",
        "publisher": "Microsoft",
        "released_date": "2024-10-30",
        "description": "Code editor",
        "download_link": "https://code.visualstudio.com",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": False,
            "cpu_memory": {
                "track_cm": True,
                "track_intr": 10
            }
        },
        "registered_date": "2024-10-30"
    },
    {
        "id": 5,
        "app_name": "Photoshop",
        "app_type": "windows",
        "current_version": "25.0.0",
        "publisher": "Adobe",
        "released_date": "2024-09-15",
        "description": "Image editing software",
        "download_link": "https://adobe.com/photoshop",
        "enable_tracking": False,
        "track": {
            "usage": False,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-09-15"
    },
    {
        "id": 6,
        "app_name": "Slack",
        "app_type": "web",
        "current_version": "4.35.0",
        "publisher": "Slack Technologies",
        "released_date": "2024-08-10",
        "description": "Team communication",
        "download_link": "https://slack.com",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-08-10"
    },
    {
        "id": 7,
        "app_name": "Spotify",
        "app_type": "windows",
        "current_version": "1.2.25",
        "publisher": "Spotify AB",
        "released_date": "2024-07-05",
        "description": "Music streaming",
        "download_link": "https://spotify.com",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": True,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-07-05"
    },
    {
        "id": 8,
        "app_name": "Discord",
        "app_type": "windows",
        "current_version": "1.0.9",
        "publisher": "Discord Inc.",
        "released_date": "2024-06-20",
        "description": "Voice and text chat",
        "download_link": "https://discord.com",
        "enable_tracking": False,
        "track": {
            "usage": False,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-06-20"
    },
    {
        "id": 9,
        "app_name": "Zoom",
        "app_type": "windows",
        "current_version": "5.16.0",
        "publisher": "Zoom Video Communications",
        "released_date": "2024-05-12",
        "description": "Video conferencing",
        "download_link": "https://zoom.us",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": False,
            "cpu_memory": {
                "track_cm": True,
                "track_intr": 15
            }
        },
        "registered_date": "2024-05-12"
    },
    {
        "id": 10,
        "app_name": "Firefox",
        "app_type": "web",
        "current_version": "121.0.0",
        "publisher": "Mozilla",
        "released_date": "2024-04-18",
        "description": "Web browser",
        "download_link": "https://mozilla.org/firefox",
        "enable_tracking": False,
        "track": {
            "usage": False,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-04-18"
    },
    {
        "id": 11,
        "app_name": "Telegram",
        "app_type": "windows",
        "current_version": "4.12.0",
        "publisher": "Telegram FZ-LLC",
        "released_date": "2024-03-25",
        "description": "Messaging app",
        "download_link": "https://telegram.org",
        "enable_tracking": True,
        "track": {
            "usage": True,
            "location": True,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-03-25"
    },
    {
        "id": 12,
        "app_name": "VLC Player",
        "app_type": "windows",
        "current_version": "3.0.18",
        "publisher": "VideoLAN",
        "released_date": "2024-02-14",
        "description": "Media player",
        "download_link": "https://videolan.org/vlc",
        "enable_tracking": False,
        "track": {
            "usage": False,
            "location": False,
            "cpu_memory": {
                "track_cm": False,
                "track_intr": 1
            }
        },
        "registered_date": "2024-02-14"
    }
]

# Load data from file on startup
applications_db, next_id = load_data_from_file()

@app.get("/api/chart-data")
def get_chart_data():
    return {
        "labels": ["January", "February", "March", "April", "May", "June", "July"],
        "values": [65, 59, 80, 81, 56, 55, 40]
    }

@app.get("/api/applications", response_model=PaginatedResponse)
def get_applications(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None)
):
    # Filter applications based on search
    filtered_apps = applications_db
    if search:
        search_lower = search.lower()
        filtered_apps = [
            app for app in applications_db
            if (search_lower in app["app_name"].lower() or
                search_lower in app["publisher"].lower() or
                search_lower in app["description"].lower())
        ]
    
    # Calculate pagination
    total = len(filtered_apps)
    pages = math.ceil(total / limit)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    
    # Get paginated results
    paginated_apps = filtered_apps[start_index:end_index]
    
    return PaginatedResponse(
        applications=paginated_apps,
        total=total,
        page=page,
        pages=pages
    )

@app.get("/api/applications/{app_id}", response_model=ApplicationResponse)
def get_application(app_id: int):
    app = next((app for app in applications_db if app["id"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@app.post("/api/applications", response_model=ApplicationResponse)
def create_application(application: Application):
    global next_id
    
    new_app = {
        "id": next_id,
        **application.dict()
    }
    
    applications_db.append(new_app)
    next_id += 1
    
    # Save to JSON file
    save_data_to_file(applications_db, next_id)
    
    return new_app

@app.put("/api/applications/{app_id}", response_model=ApplicationResponse)
def update_application(app_id: int, application: Application):
    global next_id
    
    app_index = next((i for i, app in enumerate(applications_db) if app["id"] == app_id), None)
    if app_index is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    updated_app = {
        "id": app_id,
        **application.dict()
    }
    
    applications_db[app_index] = updated_app
    
    # Save to JSON file
    save_data_to_file(applications_db, next_id)
    
    return updated_app

@app.delete("/api/applications/{app_id}")
def delete_application(app_id: int):
    app_index = next((i for i, app in enumerate(applications_db) if app["id"] == app_id), None)
    if app_index is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
    deleted_app = applications_db.pop(app_index)
    return {"message": "Application deleted successfully", "deleted_app": deleted_app}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
