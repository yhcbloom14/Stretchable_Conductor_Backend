# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LeafyLab Platform is a Next.js 15 application for biobased nanocomposite research, providing machine learning-powered material property prediction, inverse design, and data visualization capabilities. Built with React 19, TypeScript, Tailwind CSS, and Supabase.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint

# Run API tests
npm run test

# Install dependencies
npm install
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.1.5 (App Router)
- **Language**: TypeScript 5.7.3
- **Styling**: Tailwind CSS 3.4.1
- **State**: Redux Toolkit
- **Database**: Supabase (PostgreSQL)
- **UI**: Ant Design + custom components
- **Visualization**: Plotly.js, D3.js

### Key Directories
- `/app` - Next.js App Router structure with route groups
- `/components` - Atomic design components (atoms, common, features)
- `/lib` - Business logic (actions, API, store, types, utils)
- `/scripts` - Utility scripts including API testing

### App Router Structure
```
app/
├── (auth)/          # Authentication routes
├── (main)/          # Main application
│   ├── (features)/  # Feature pages
│   │   ├── data/    # Data management
│   │   ├── overview/ # Dashboard
│   │   ├── settings/ # Settings
│   │   └── views/   # Analysis views (design, heatmap, prediction)
│   └── join/        # Organization joining
```

### State Management
- Redux store with typed hooks in `/lib/store`
- Slices: Profile, Organization, Files, Templates
- Constants defined in `/lib/constants.ts`

## API Integration

### External APIs
- **Binder API**: `https://binder-api-ng.matal.dev` (main ML predictions)
- **Biowrap API**: `https://biowrap-api.matal.dev` (testing)
- **Supabase**: Database and authentication

### API Testing
Run `npm run test` to execute `/scripts/test.js` which validates ML API endpoints with sample formulations.

## Key Features

### Machine Learning
- **Inverse Design**: AI-powered material formulation optimization
- **Direct Prediction**: Property prediction from compositions
- **Uncertainty/Feasibility**: Cutoffs defined in constants (0.6 feasibility, 30 uncertainty)

### Data Management
- CSV file upload and processing
- Template system for reusable schemas
- Multi-tenant organization structure

### Visualization
- Interactive heatmaps and clustering
- Plotly.js integration for scientific charts
- Custom color palette and theming

## Authentication & Security

- Supabase Auth with email/password
- Session management via middleware
- Role-based access (organization-level)
- Multi-tenant architecture with organization isolation

## Development Notes

### TypeScript Configuration
- Path aliases configured for clean imports
- Strict type checking enabled
- Custom types in `/lib/types`

### Styling System
- Tailwind with extensive custom configuration
- Dark/light mode support via next-themes
- Inter font family
- Custom color palette (violet, sky, green variants)

### Component Patterns
- Atomic design methodology
- Reusable input components with validation
- Custom table components for data display
- Modal and notification systems

## Testing

Current testing setup includes API validation script. The codebase would benefit from:
- Unit tests for utilities and components
- Integration tests for API endpoints
- E2E tests for critical user flows

### Active Development Areas (from README.md)
- **Refactor**: Uncertainty & Feasibility validation (isUncertainty/isFeasibility columns need cutoffs)
- **Metadata Pages**: Implementation needed
- **lib/types**: Should be used as basis for API contracts/schemas
- **Password Change Testing**: Invalid hash and altered hash scenarios need testing

## Important Files

- `/middleware.ts` - Supabase session management
- `/lib/constants.ts` - API endpoints and configuration
- `/lib/store/index.ts` - Redux store setup
- `/tailwind.config.js` - Custom design system
- `/scripts/test.js` - API testing script