# Project Structure

This document describes the professional folder structure of the MERN application.

## Backend Structure (`/src`)

```
src/
├── config/
│   └── index.ts              # Environment configuration & validation
├── controllers/              # Request handlers (route logic)
│   ├── auth.controller.ts
│   ├── participant.controller.ts
│   └── bot.controller.ts
├── middleware/                # Express middleware
│   ├── auth.middleware.ts     # Authentication middleware
│   ├── errorHandler.ts        # Centralized error handling
│   └── requestLogger.ts      # Request logging
├── routes/                   # Route definitions (minimal logic)
│   ├── auth.routes.ts
│   └── participant.routes.ts
├── services/                  # Business logic
│   └── auth.service.ts        # Authentication & session management
├── types/
│   └── interfaces.ts         # TypeScript interfaces & types
└── server.ts                 # Application entry point
```

### Principles:
- **Controllers**: Handle HTTP requests/responses, call services
- **Services**: Contain business logic, data manipulation
- **Middleware**: Request processing, authentication, error handling
- **Routes**: Define endpoints, delegate to controllers
- **Types**: Centralized TypeScript definitions

## Frontend Structure (`/frontend/src`)

```
frontend/src/
├── components/               # Shared/reusable components
│   └── ErrorBoundary.tsx
├── constants/                # Application constants
│   └── index.ts
├── context/                  # React Context providers
│   └── DirectLineTokenContext.tsx
├── features/                 # Feature-based organization
│   ├── auth/
│   │   ├── components/
│   │   │   └── SignInForm.tsx
│   │   └── hooks/
│   │       └── useAuth.ts
│   ├── participant/
│   │   └── components/
│   │       └── ParticipantDashboard.tsx
│   └── chat/
│       └── components/
│           └── CopilotChat.tsx
├── services/                 # API & external service integrations
│   └── api.service.ts
├── types/                    # TypeScript type definitions
│   └── index.ts
├── App.tsx                   # Root component
└── index.tsx                 # Application entry point
```

### Principles:
- **Features**: Organized by domain/feature (auth, participant, chat)
- **Components**: Reusable UI components
- **Services**: API clients, external integrations
- **Types**: Centralized type definitions
- **Constants**: Application-wide constants

## Benefits of This Structure

1. **Separation of Concerns**: Clear boundaries between layers
2. **Scalability**: Easy to add new features/modules
3. **Maintainability**: Related code grouped together
4. **Testability**: Isolated modules easier to test
5. **Team Collaboration**: Clear ownership and structure
6. **Type Safety**: Centralized type definitions
7. **Reusability**: Shared components and utilities

