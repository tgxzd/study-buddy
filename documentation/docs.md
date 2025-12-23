📘 StudyBuddy – Full Project Documentation
1️⃣ Project Requirement Document (PRD)
Project Name

StudyBuddy

Problem Statement

Students lack a simple, collaborative platform for:

Sharing study notes

Scheduling group study sessions

Chatting in real time

Tracking group progress

Existing tools (Google Classroom, Notion, Discord) are too fragmented or complex for small study groups.

Goal

Build a lightweight collaboration platform focused on:

Study groups

File sharing

Scheduling

Real-time chat

Target Users

University students

Self-study groups

Online course learners

User Roles
Role	Description
Student	Main user – joins groups, uploads notes, chats
Admin	Same as Student (no dashboard), only for moderation (future-ready)

⚠️ MVP: No admin panel

Core MVP Features

Authentication (JWT)

Study group creation & discovery

Join request approval system (owner must accept)

File upload & sharing

Study session scheduling

Real-time group chat

Calendar view

Out of Scope (MVP)

Payments

Notifications (email/push)

AI features

Mobile app

2️⃣ App Flow Document
Authentication Flow
Landing Page
 → Sign Up
 → Login
 → JWT Stored (HTTP-only cookie)
 → Dashboard

Main User Flow
Dashboard
 ├── Create Study Group
 ├── Request to Join Study Group (via Group ID/Code)
 │    └── Owner approves request
 ├── Open Group
 │    ├── Chat
 │    ├── Notes
 │    └── Schedule
 └── Profile

Join Request Flow
User finds group
 → Clicks "Request to Join"
 → Request created (PENDING status)
 → Owner sees badge with pending count
 → Owner views requests in group detail
 → Owner accepts/declines
 ├── Accept: User added to group, status = ACCEPTED
 └── Decline: Request rejected, status = REJECTED
User can cancel pending request anytime

File Upload Flow
User selects file
 → Frontend validates
 → Backend generates S3 presigned URL
 → File uploaded to S3
 → Metadata saved in PostgreSQL

3️⃣ Tech Stack Document
Frontend

Vite + React

React Router v7

Tailwind CSS v4

Socket.io-client

Yarn

Lucide React (icons)

Backend

Node.js

React Router v7 (Server Mode)

JWT Authentication

Socket.io

Prisma ORM

Database

PostgreSQL

Infrastructure

AWS EC2 (Backend)

AWS S3 (File storage)

Docker

GitHub Actions (CI/CD)

4️⃣ Frontend Guidelines Document
Current Folder Structure

app/
├── components/
│   ├── common/
│   │   └── Navbar.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
├── routes/
│   ├── root.tsx (Layout + loader)
│   ├── home.tsx (Landing page)
│   ├── dashboard.tsx
│   ├── auth/
│   │   ├── register.tsx
│   │   ├── login.tsx
│   │   └── logout.tsx
│   └── groups/
│       ├── groups.tsx (List all groups)
│       ├── groups.create.tsx (Create new group)
│       ├── groups.$id.tsx (Group details)
│       └── groups.requests.tsx (Join request API)
├── server/
│   ├── config/
│   │   ├── database.ts
│   │   └── jwt.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── groupService.ts
│   │   └── joinRequestService.ts
│   └── utils/
│       ├── cookie.ts
│       ├── password.ts
│       └── validation.ts
└── app.css

State Management

Local state for UI only

Server-side data fetching with React Router v7 loaders/actions

Styling

Tailwind utility-first (v4 with @import syntax)

Inline styles for dynamic components (when needed)

Responsive-first

Purple theme (#6B46C1 primary)

Rules

One feature = one route folder

No business logic in components

Server actions directly in route files

5️⃣ Backend Guidelines Document
Current Folder Structure

app/server/
├── config/
│   ├── database.ts (Prisma client)
│   └── jwt.ts (JWT config)
├── services/
│   ├── authService.ts (Auth operations)
│   ├── groupService.ts (Group operations)
│   └── joinRequestService.ts (Join request operations)
└── utils/
    ├── cookie.ts (Cookie helpers)
    ├── password.ts (Hashing)
    └── validation.ts (Zod schemas)

Architecture

React Router v7 Server Mode (not Express)

Routes → Actions/Loaders → Services

Prisma only inside services

JWT middleware for protected routes (in loaders)

Error Handling

Try-catch in services

Standard response format via JSON returns

{
  "success": false,
  "message": "Error message"
}

6️⃣ App Flowchart (Textual)
User
 ↓
Login/Register
 ↓
Dashboard
 ↓
Study Group
 │
 ├── Join Request System (Implemented)
 │    ├── User requests to join
 │    ├── Owner sees pending count badge
 │    ├── Owner approves/declines
 │    └── User added as member on approval
 │
 ├── Chat (Socket.io) - PENDING
 ├── Notes (S3) - PENDING
 └── Schedule (Calendar) - PENDING

7️⃣ Security Guideline Document
Authentication

JWT (Access Token)

Stored in HTTP-only cookies

Expiry: 7 days (configured via JWT_EXPIRES_IN env var)

HTTP-only flag prevents JavaScript access (XSS protection)

Secure flag ensures HTTPS-only in production

SameSite=Lax prevents CSRF attacks

Authorization

Group-based access control

Only members can:

Upload files

Chat

Schedule sessions

Only group owners can:

Approve/decline join requests

View pending requests

Delete the group

File Security

Presigned S3 URLs (PENDING)

File size limit (e.g. 10MB)

Allowed types: pdf, docx, jpg, png

General

Helmet middleware (PENDING)

Rate limiting (PENDING)

Input validation (Zod)

8️⃣ Database Design Document
ER Diagram (Text)
User ──< GroupMember >── StudyGroup
User ──< GroupJoinRequest >── StudyGroup
User ──< File
StudyGroup ──< StudySession
StudyGroup ──< ChatMessage

Prisma Models (Implemented)

User {
  id (UUID)
  name
  email
  password (hashed)
  role (STUDENT | ADMIN)
  createdAt
  updatedAt

  Relations:
  - ownedGroups (StudyGroup[])
  - memberships (GroupMember[])
  - joinRequests (GroupJoinRequest[])
  - uploadedFiles (File[])
  - chatMessages (ChatMessage[])
}

StudyGroup {
  id (UUID)
  name
  description
  ownerId
  createdAt
  updatedAt

  Relations:
  - owner (User)
  - members (GroupMember[])
  - joinRequests (GroupJoinRequest[])
  - files (File[])
  - sessions (StudySession[])
  - chatMessages (ChatMessage[])
}

GroupMember {
  id (UUID)
  userId
  groupId
  joinedAt

  Relations:
  - user (User)
  - group (StudyGroup)

  Unique: [userId, groupId]
}

GroupJoinRequest {
  id (UUID)
  userId
  groupId
  status (PENDING | ACCEPTED | REJECTED)
  createdAt
  updatedAt

  Relations:
  - user (User)
  - group (StudyGroup)

  Unique: [userId, groupId]
}

StudySession {
  id (UUID)
  title
  description
  date (DateTime)
  link
  location
  groupId
  createdAt
  updatedAt

  Relations:
  - group (StudyGroup)
}

ChatMessage {
  id (UUID)
  content
  userId
  groupId
  createdAt

  Relations:
  - user (User)
  - group (StudyGroup)
}

File {
  id (UUID)
  url
  filename
  mimeType
  size
  groupId
  uploaderId
  createdAt

  Relations:
  - group (StudyGroup)
  - uploader (User)
}

9️⃣ API Documentation
Auth (Implemented via React Router Actions)
POST /auth/register - User registration
POST /auth/login - User login
GET /auth/logout - User logout

Groups (Implemented via React Router Actions)
POST /groups/create - Create group
GET /groups - List all groups
GET /groups/:id - Get group details
POST /groups (join by code) - Request to join with group code

Join Requests (Implemented via React Router Actions)
POST /groups.requests (intent: create) - Create join request
POST /groups.requests (intent: accept) - Accept join request
POST /groups.requests (intent: reject) - Reject join request
POST /groups.requests (intent: cancel) - Cancel pending request

Files (PENDING)
POST /files/upload - Upload file
GET /files/group/:groupId - List group files
DELETE /files/:id - Delete file

Schedule (PENDING)
POST /sessions - Create session
GET /sessions/:groupId - List group sessions
PUT /sessions/:id - Update session
DELETE /sessions/:id - Delete session

Chat (PENDING)
Socket.io events for real-time messaging

🔟 Non-Functional Requirements (NFR)
Category	Requirement
Performance	API < 500ms
Scalability	Stateless backend
Availability	99% uptime
Security	HTTPS only
Maintainability	Modular code

1️⃣1️⃣ Deployment Document
Backend

EC2 Ubuntu

Dockerized Node app

Nginx reverse proxy

Frontend

Vercel / Netlify (optional)

Environment-based configs

1️⃣2️⃣ UI/UX Guidelines

Minimal design

Clear call-to-actions

No clutter

Mobile responsive

Consistent spacing & typography

Dark navbar with purple accents (#6B46C1)

Warning badges for pending requests (yellow/amber theme)

1️⃣3️⃣ Data Dictionary
Field	Type	Description
user.id	UUID	User identifier
group.id	UUID	Study group
groupJoinRequest.status	Enum	PENDING | ACCEPTED | REJECTED
file.url	String	S3 URL
session.date	Date	Study time

1️⃣4️⃣ Git Workflow & CI/CD
Branching
main
 └── dev
      └── feature/*

CI Pipeline

Lint

Test

Build Docker image

Push to registry

Deploy to EC2

1️⃣5️⃣ Docker Documentation
Backend Dockerfile
FROM node:18
WORKDIR /app
COPY package.json yarn.lock .
RUN yarn install
COPY . .
CMD ["yarn", "start"]

docker-compose

API

frontend

PostgreSQL

1️⃣6️⃣ AWS Architecture
User
 → Frontend
 → EC2 (React Router Server)
 → PostgreSQL
 → S3 (Files)

✅ Final Advice (Important)

To avoid errors:

Build feature by feature

Dockerize after it works locally

Use .env.example

Log everything

Keep MVP small



**before start code explore all the files and study the files structure first

**.env
