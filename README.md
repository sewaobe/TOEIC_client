# TOEIC Client

A modern React-based frontend application for TOEIC learning and testing platform. Built with TypeScript, Vite, and Material-UI for an enhanced user experience.

## 🚀 Features

- **User Authentication**: Secure login and registration system
- **Interactive Lessons**: Comprehensive TOEIC preparation lessons
- **Practice Tests**: Full TOEIC test simulations with real-time scoring
- **Flashcard System**: Vocabulary learning with spaced repetition
- **Study Calendar**: Personalized learning schedules and progress tracking
- **Notebook**: Note-taking functionality for lessons
- **Profile Management**: User profile and progress analytics
- **Real-time Notifications**: Live updates and notifications
- **Responsive Design**: Mobile-first design with Material-UI components

## 🛠️ Tech Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 6.0.1
- **UI Library**: Material-UI (MUI) 7.3.1
- **State Management**: Redux Toolkit 2.8.2
- **HTTP Client**: Axios 1.11.0
- **Routing**: React Router DOM 6.30.1
- **Form Handling**: React Hook Form 7.62.0 with Zod validation
- **Styling**: Tailwind CSS 3.4.17
- **Animations**: Framer Motion 12.23.12
- **Charts**: Recharts 3.2.1
- **Rich Text Editor**: Quill 1.3.7 and Milkdown 7.15.5
- **Image Upload**: Cloudinary integration
- **Local Storage**: IndexedDB with idb-keyval

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager
- TOEIC Server running on port 5000

## 🚀 Getting Started

### Installation

1. Clone the repository and navigate to the client directory:
```bash
cd TOEIC_client
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── views/              # Page components and layouts
│   ├── layouts/        # Layout components
│   └── pages/          # Page components
├── stores/             # Redux store slices
├── viewmodels/         # Business logic hooks
├── utils/              # Utility functions
├── constants/          # Application constants
└── types/              # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for image uploads | Yes |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Cloudinary upload preset | Yes |

### Tailwind CSS

The project uses Tailwind CSS with custom configuration in `tailwind.config.js`. Additional utilities are added for 3D transforms and custom shadows.

### ESLint

ESLint is configured with TypeScript and React rules. For production builds, consider enabling type-aware linting as described in the configuration section.

## 🌐 API Integration

The client communicates with the TOEIC Server API. Key endpoints include:

- `/auth/*` - Authentication endpoints
- `/tests/*` - Test management
- `/lessons/*` - Lesson content
- `/flashcards/*` - Vocabulary management
- `/users/*` - User profile and progress

## 📱 Features Overview

### Authentication Flow
- User registration and login
- Password reset functionality
- JWT token-based authentication
- Protected routes

### Learning Platform
- Interactive lessons with multimedia content
- Progress tracking and analytics
- Personalized study plans
- Calendar-based scheduling

### Testing System
- Full TOEIC test simulations
- Real-time scoring and feedback
- Answer review and explanations
- Performance analytics

### Vocabulary Learning
- Flashcard system with spaced repetition
- Audio pronunciation support
- Progress tracking
- Custom vocabulary lists

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support and questions, please contact the development team or create an issue in the repository.
