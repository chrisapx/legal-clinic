# Legal Clinic Uganda - Web Application

React web application for the Legal Clinic Uganda platform, providing a user-friendly interface for legal consultations, document generation, and community learning.

## Features

- **AI-Powered Chat**: Legal assistance chatbot using OpenAI
- **User Management**: Registration and profile management for clients and lawyers
- **Document Generation**: Generate legal documents from templates
- **Learning Platform**: Blog posts, Q&A forum, and news updates
- **Lawyer Directory**: Find and connect with verified lawyers
- **Legal Firm Management**: Manage law firm profiles and lawyers

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build
```bash
npm run build
npm run preview
```

## API Integration

The app connects to the Spring Boot backend on port 8080. All `/api/*` requests are proxied to `http://localhost:8080/api/*`.

See `src/services/api.js` for all available API endpoints.

## Backend

Make sure the backend is running:
```bash
cd ../kw-engine-adapter
./gradlew bootRun
```
