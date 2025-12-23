# StudyBuddy - Core Features TODO

## ✅ Phase 1: Authentication (Completed)

- [x] User registration with email/password
- [x] User login with JWT
- [x] HTTP-only cookie for session (7 days expiration)
- [x] Protected dashboard route
- [x] Logout functionality
- [x] Database setup with Prisma (PostgreSQL)
- [x] Dark navbar with proper auth state display

---

## ✅ Phase 2: Study Groups (Completed)

### Backend
- [x] StudyGroup service (create, list, join, leave, getById, isMember)
- [x] Group access control (member checking)
- [x] UUID-based group IDs for shareable codes

### Frontend
- [x] Groups list page (browse all groups)
- [x] Create group form
- [x] Group detail page
- [x] Join/leave group buttons
- [x] Show group members list
- [x] Join by group ID/code feature
- [x] Copy/share group code feature
- [x] Breadcrumb navigation (Dashboard > Groups > Group Name)

### API Endpoints
- [x] POST /groups/create - Create group
- [x] GET /groups - List all groups
- [x] GET /groups/:id - Get group details
- [x] POST /groups/:id (join/leave) - Join/Leave a group

### UI/UX
- [x] Fixed dark navbar (#1f2937 background)
- [x] Purple theme (#6B46C1 primary)
- [x] Breadcrumb navigation on all group pages
- [x] Stats cards showing group/member counts
- [x] Empty states with helpful messages
- [x] Responsive card layouts

---

## ✅ Phase 2.5: Join Request Approval System (Completed)

### Backend
- [x] GroupJoinRequest model with PENDING/ACCEPTED/REJECTED status
- [x] JoinRequestService (create, accept, reject, cancel)
- [x] Get pending requests for group (owner only)
- [x] Check pending request status for user
- [x] Unique constraint on userId + groupId
- [x] Cascade delete on user/group deletion

### Frontend - Groups List Page
- [x] Pending request count badge on owned groups
- [x] UserPlus icon with warning color
- [x] "Request to Join" button (changed from "Join Group")

### Frontend - Group Detail Page
- [x] Owner sees pending requests banner
- [x] Expandable list of pending requests
- [x] Accept/Decline buttons for each request
- [x] Non-members see "Request to Join" button
- [x] Pending state shows "Request Pending" with cancel option
- [x] Members see "You're a member" with leave option

### API Endpoints
- [x] POST /groups (join by code) - Creates join request instead of direct join
- [x] POST /groups/:id (intent: accept/reject) - Accept/Reject requests
- [x] POST /groups/:id (intent: request-join) - Request to join
- [x] POST /groups/:id (intent: cancel-request) - Cancel pending request

### Files Created
- [x] `app/server/services/joinRequestService.ts` - Join request operations
- [x] Prisma schema updated with GroupJoinRequest model and JoinRequestStatus enum

---

## 🐳 Phase 7: Deployment (Completed)

### Docker Setup (Completed)
- [x] Dockerfile (multi-stage build with Node 20 Alpine)
- [x] docker-compose.yml (with PostgreSQL)
- [x] .dockerignore (optimized for smaller images)
- [x] Non-root user configuration for security
- [x] Health check for PostgreSQL
- [x] Prisma migration files created (20251223135056_init)
- [x] Using `prisma db push` in Docker (reliable for containers)
- [x] Docker build tested and working locally

### CI/CD (Completed)
- [x] GitHub Actions CI workflow (lint, typecheck, build)
- [x] GitHub Actions Docker workflow (build & push to GHCR)
- [x] Automated testing on push to main/dev branches
- [x] Docker image automatically pushed to GitHub Container Registry

### Git Workflow (Completed)
- [x] Branching strategy defined
- [x] CI/CD pipelines configured
- [x] Automated testing on PRs

### Deployment Notes
- **Local vs Docker databases**: Separate databases for local dev and Docker
- **Migration approach**: `prisma db push` for Docker, `prisma migrate dev` for local development
- **GitHub image**: `ghcr.io/username/repo:latest` - Built automatically on push to main!!!!
- **Local development**: Use `docker-compose up -d` for local Docker testing

### AWS Deployment (On Hold)
- [ ] EC2 deployment
- [ ] S3 bucket creation for file storage
- [ ] Environment configurations for production

---

## 📁 Phase 3: File Sharing

### Backend
- [x] File model (id, url, filename, groupId, uploaderId, createdAt)
- [ ] S3 integration for file storage
- [ ] Presigned URL generation
- [ ] File upload validation (size limit 10MB, types: pdf, docx, jpg, png)
- [ ] File service (create, list, delete)

### Frontend
- [ ] File upload component
- [ ] Files list in group detail page
- [ ] Download file button
- [ ] Delete file (owner only)

### API Endpoints
- [ ] POST /files/upload - Upload file
- [ ] GET /files/group/:groupId - List group files
- [ ] DELETE /files/:id - Delete file

---

## 📅 Phase 4: Study Sessions

### Backend
- [x] StudySession model (id, title, date, link, groupId, createdAt, updatedAt)
- [ ] Session service (create, list, update, delete)
- [ ] List sessions by group

### Frontend
- [ ] Session creation form
- [ ] Sessions list in group detail page
- [ ] Calendar view
- [ ] Edit/delete session (owner only)

### API Endpoints
- [ ] POST /sessions - Create session
- [ ] GET /sessions/:groupId - List group sessions
- [ ] PUT /sessions/:id - Update session
- [ ] DELETE /sessions/:id - Delete session

---

## 💬 Phase 5: Real-time Chat

### Backend
- [x] ChatMessage model (id, content, userId, groupId, createdAt)
- [ ] Socket.io setup
- [ ] Join/leave room functionality
- [ ] Broadcast message to group
- [ ] Chat history (last 50 messages)

### Frontend
- [ ] Socket.io client setup
- [ ] Chat component (message list + input)
- [ ] Real-time message updates
- [ ] Show sender name
- [ ] Timestamp for messages

### Socket Events
- [ ] join:room - User joins group chat
- [ ] leave:room - User leaves group chat
- [ ] send:message - Send message to group
- [ ] receive:message - Receive message

---

## 🔐 Phase 6: Security & Polish

### Security
- [x] Group-based access control middleware (protect files/sessions/chat)
- [x] Owner-only actions (approve requests, delete group)
- [ ] File upload size limits
- [ ] File type validation
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization

### Polish
- [x] Loading states for all async actions
- [x] Error handling with user-friendly messages
- [x] Responsive design (mobile)
- [ ] Accessibility improvements
- [ ] Unit tests for services

---

## Progress Summary

| Phase | Status |
|-------|--------|
| Authentication | ✅ Completed |
| Study Groups | ✅ Completed |
| Join Request System | ✅ Completed |
| File Sharing | ⏳ Pending |
| Study Sessions | ⏳ Pending |
| Real-time Chat | ⏳ Pending |
| Security & Polish | ⏳ Partial |
| Docker & CI/CD | ✅ Completed |
| Prisma Migrations | ✅ Completed |

---

## Files Created/Modified

### Phase 1 (Auth)
- `app/server/config/database.ts` - Prisma client setup
- `app/server/config/jwt.ts` - JWT configuration (7 days expiration)
- `app/server/services/authService.ts` - Auth operations
- `app/server/utils/password.ts` - Password hashing
- `app/server/utils/cookie.ts` - Cookie helpers (7 days maxAge)
- `app/server/utils/validation.ts` - Zod schemas
- `app/components/ui/Button.tsx` - Reusable button component
- `app/components/ui/Input.tsx` - Reusable input component
- `app/components/ui/Card.tsx` - Reusable card component
- `app/components/common/Navbar.tsx` - Navigation bar (dark theme, fixed position)
- `app/routes/auth/register.tsx` - Registration page
- `app/routes/auth/login.tsx` - Login page
- `app/routes/auth/logout.tsx` - Logout route
- `app/routes/dashboard.tsx` - Dashboard page
- `app/routes/home.tsx` - Landing page
- `app/routes/root.tsx` - Root layout with loader

### Phase 2 (Groups)
- `app/server/services/groupService.ts` - Group operations
- `app/routes/groups.tsx` - Groups list page with join-by-code
- `app/routes/groups.create.tsx` - Create group page
- `app/routes/groups.$id.tsx` - Group detail page with share code

### Phase 2.5 (Join Request System)
- `app/server/services/joinRequestService.ts` - Join request CRUD operations
- `prisma/schema.prisma` - Added GroupJoinRequest model and JoinRequestStatus enum

### Phase 7 (Docker & CI/CD)
- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Local development with PostgreSQL
- `.dockerignore` - Optimized Docker build context
- `.github/workflows/ci.yml` - Lint, typecheck, and build pipeline
- `.github/workflows/docker.yml` - Docker build and push to GHCR
- `prisma/migrations/20251223135056_init/` - Initial database migration files

---

## Important Notes

### Configuration
- **JWT Expiration**: 7 days (configured via `JWT_EXPIRES_IN` env var)
- **Cookie Max-Age**: 7 days (604800 seconds)
- **Group IDs**: UUID-based, used as shareable codes
- **Navbar**: Fixed position, dark theme (#1f2937), purple accent (#6B46C1)

### Join Request System
- **Request Flow**: User requests → Owner approves → User becomes member
- **Status Values**: PENDING, ACCEPTED, REJECTED
- **Owner Actions**: View pending requests, accept/reject
- **User Actions**: Create request, cancel pending request
- **Validation**: Cannot request if already member or has pending request
- **Unique Constraint**: One request per user-group combination

### React Router v7 Specific
- Using Server Mode (not Express)
- Loaders/Actions in route files
- `useLoaderData` in route components (App), not in Layout
- Server-side rendering with client-side hydration
- `useFetcher` for non-redirecting form submissions (accept/reject buttons)

### Tech Stack
- **Frontend**: React Router v7, Tailwind CSS v4, Lucide React icons
- **Backend**: React Router v7 Server Mode (not Express)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with HTTP-only cookies
- **Package Manager**: Yarn (not npm)
- **Container**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry (GHCR)

### CI/CD Workflow
- **CI Workflow**: Runs on push to main/dev branches
  - Lint (ESLint) - continues on error
  - Type check (TypeScript) - must pass
  - Build - runs after typecheck passes
- **Docker Workflow**: Runs on push to main branch
  - Builds Docker image
  - Pushes to `ghcr.io/username/repo:latest`
  - Tags versions for releases (v1.0.0, etc.)

### Docker Commands
```bash
# Local development
docker-compose up -d

# View logs
docker logs studybuddy-app

# Stop containers
docker-compose down

# Rebuild after code changes
docker-compose build --no-cache
```
