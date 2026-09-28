# Cogniform — API Reference Guide

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Public |
| --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Register a new user & generate default workspace | Yes |
| `POST` | `/api/auth/login` | Authenticate user & attach httpOnly JWT cookies | Yes |
| `POST` | `/api/auth/logout` | Clear authentication cookies | No |
| `POST` | `/api/auth/refresh` | Issue new access token using refresh cookie | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & workspace roster | No |

## Workspaces & RBAC (`/api/workspaces`)

| Method | Endpoint | Description | Min Role |
| --- | --- | --- | --- |
| `POST` | `/api/workspaces` | Create workspace | Member |
| `GET` | `/api/workspaces` | List user workspaces | Member |
| `GET` | `/api/workspaces/:id` | Get workspace details | Viewer |
| `POST` | `/api/workspaces/:id/members` | Invite new team member | Admin |
| `PATCH` | `/api/workspaces/:id/members/:memberId` | Update member role | Admin |
| `DELETE` | `/api/workspaces/:id/members/:memberId` | Remove member | Admin |

## Forms & Drag-and-Drop Builder (`/api/forms`)

| Method | Endpoint | Description | Min Role |
| --- | --- | --- | --- |
| `POST` | `/api/forms` | Create new form | Editor |
| `GET` | `/api/forms?workspaceId=...` | List workspace forms | Viewer |
| `GET` | `/api/forms/:id` | Fetch full form schema tree | Viewer |
| `PATCH` | `/api/forms/:id` | Update settings / publish form | Editor |
| `POST` | `/api/forms/:id/sections` | Add form section | Editor |
| `POST` | `/api/forms/sections/:sectionId/fields` | Add form field | Editor |
| `POST` | `/api/forms/fields/:fieldId/logic` | Add conditional logic rule | Editor |

## Public Endpoints (`/api/public`)

| Method | Endpoint | Description | Public |
| --- | --- | --- | --- |
| `GET` | `/api/public/forms/:slug` | Unauthenticated public form renderer schema | Yes |
| `POST` | `/api/public/forms/:slug/responses` | Submit end-user form responses | Yes |
| `POST` | `/api/analytics/forms/:formId/view` | Track form view impression | Yes |
