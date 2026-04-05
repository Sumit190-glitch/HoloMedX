# AI-Based MEP Clash Detection & Auto-Rerouting System

## Overview

This project is an **AI-powered Building Information Modeling (BIM)
system** that automatically detects clashes between MEP components and
intelligently suggests or generates rerouting solutions.

MEP stands for: - Mechanical (HVAC ducts) - Electrical (Cable trays) -
Plumbing (Pipes)

The system analyzes BIM models, detects clashes such as **Pipe--Pipe,
Pipe--Duct, Duct--Duct, Cable Tray conflicts**, and proposes optimized
rerouting paths following engineering constraints.

------------------------------------------------------------------------

## Problem Statement

In large construction projects, MEP systems are designed by multiple
teams.\
This often results in **clashes or overlaps between pipes, ducts, and
electrical trays**.

Manual clash detection tools require engineers to manually resolve
issues, which: - consumes significant time - increases project cost -
may lead to design errors

This project automates the process using **AI + BIM data processing**.

------------------------------------------------------------------------

## Key Features

-   Upload BIM models (.rvt / .ifc)
-   Automatic clash detection
-   AI-based rerouting suggestions
-   Engineering rule validation
-   Interactive 3D visualization
-   Export updated BIM models

------------------------------------------------------------------------

## System Architecture

``` mermaid
flowchart TD

A[Engineer / User] --> B[Web Application]

subgraph FRONTEND
B --> C[3D BIM Viewer]
C --> D[Upload RVT / IFC Model]
C --> E[Clash Visualization]
C --> F[Rerouting Preview]
end

D --> G[API Gateway]

subgraph BACKEND
G --> H[File Processing Service]
G --> I[Clash Detection Service]
G --> J[AI Rerouting Service]
G --> K[Model Update Service]
end

subgraph BIM_DATA_PROCESSING
H --> L[Convert RVT to IFC / glTF]
L --> M[Geometry Extraction]
M --> N[Component Metadata Extraction]
N --> O[Spatial Index Creation]
end

subgraph CLASH_ENGINE
O --> P[Bounding Box Collision]
P --> Q[Mesh Intersection]
Q --> R[Clash Classification]
end

subgraph RULE_ENGINE
R --> S[Engineering Rules]
S --> T[Clash Severity]
end

subgraph AI_ROUTING
T --> U[3D Graph Generation]
U --> V[A* Path Planning]
V --> W[Generate New Route]
W --> X[Validate Constraints]
end

subgraph MODEL_UPDATE
X --> Y[Rebuild Components]
Y --> Z[Updated BIM Model]
end

Z --> AA[3D Visualization]
```

------------------------------------------------------------------------

## Project Pipeline

1.  Upload BIM model (.rvt / .ifc)
2.  Convert model to IFC / glTF format
3.  Extract geometry and component metadata
4.  Detect clashes between MEP components
5.  Apply engineering rules and constraints
6.  Generate alternative routing paths
7.  Update BIM model
8.  Visualize rerouted components

------------------------------------------------------------------------

## Agile Development Workflow

### Sprint 1

-   Project setup
-   File upload
-   Basic 3D viewer

### Sprint 2

-   Geometry extraction
-   Clash detection engine

### Sprint 3

-   Engineering rule engine
-   Clash classification

### Sprint 4

-   AI rerouting algorithm
-   Path planning implementation

### Sprint 5

-   BIM model update
-   Visualization and reporting

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   React.js
-   Three.js
-   IFC.js
-   Tailwind CSS

### Backend

-   Python (FastAPI)
-   Node.js

### BIM Tools

-   Autodesk Revit API
-   Autodesk Navisworks
-   IfcOpenShell

### AI / Geometry Processing

-   PyTorch
-   Open3D
-   Scikit-learn

### Database

-   MongoDB
-   PostgreSQL

------------------------------------------------------------------------

## Folder Structure

    project-root
    │
    ├── frontend
    │   ├── components
    │   ├── viewer
    │   └── pages
    │
    ├── backend
    │   ├── api
    │   ├── services
    │   ├── clash_engine
    │   └── ai_routing
    │
    ├── bim_processing
    │   ├── geometry
    │   └── parsers
    │
    ├── database
    │
    └── README.md

------------------------------------------------------------------------

## Installation

### Clone Repository

    git clone https://github.com/your-repo/project-name.git

### Backend Setup

    cd backend
    pip install -r requirements.txt
    uvicorn main:app --reload

### Frontend Setup

    cd frontend
    npm install
    npm run dev

------------------------------------------------------------------------

## Future Improvements

-   Real-time clash detection
-   Reinforcement learning routing
-   AR/VR BIM visualization
-   Cloud-based BIM collaboration
-   Large-scale building optimization

------------------------------------------------------------------------

## License

MIT License
