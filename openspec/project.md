# Project Context

## Purpose
HepiBite is a comprehensive e-commerce platform for food and snack delivery, designed to connect customers with local food vendors and partners. The platform enables:

- **Product Management**: Admin interface for managing food products, categories, variants, and inventory
- **Order Processing**: Complete order lifecycle from placement to delivery tracking
- **Payment Integration**: Support for various payment methods with voucher/discount systems
- **Delivery Management**: In-house delivery coordination with driver assignment
- **Partner Ecosystem**: Integration with food partners/vendors for product sourcing
- **Admin Dashboard**: Comprehensive analytics, user management, and business operations

The platform serves both B2C customers through a shop interface and B2B partners through admin tools, with a focus on Indonesian market delivery services.

## Tech Stack
### Frontend
- **Next.js 15.5.3**: React framework with App Router for full-stack web applications
- **React 19.1.0**: UI library with modern features and concurrent rendering
- **TypeScript 5**: Type-safe JavaScript with strict type checking
- **Tailwind CSS 4**: Utility-first CSS framework for styling
- **Framer Motion**: Animation library for smooth UI transitions
- **Radix UI**: Accessible, unstyled UI primitives (Dialog, Dropdown, etc.)
- **TipTap**: Rich text editor for product descriptions and content
- **React Hook Form + Zod**: Form handling with schema validation
- **Lucide React**: Icon library for consistent UI elements
- **Next Themes**: Dark/light theme support with system preference detection

### Backend & Database
- **Next.js API Routes**: Server-side API endpoints
- **Prisma 6.16.2**: ORM for database operations with type-safe queries
- **PostgreSQL**: Primary database for transactional data
- **JWT (jose library)**: Authentication tokens with HS256 signing
- **bcrypt**: Password hashing for admin authentication

### Development & Testing
- **ESLint 9**: Code linting with Next.js and TypeScript rules
- **Jest 29**: Unit testing framework with React Testing Library
- **TypeScript Compiler**: Type checking and compilation
- **Turbopack**: Fast bundler for development builds

### Infrastructure & External Services
- **MinIO**: S3-compatible object storage for file uploads
- **GOWA**: WhatsApp integration for notifications (optional)
- **Docker**: Containerization for development environment
- **AWS S3 SDK**: Optional cloud storage integration

## Project Conventions

### Code Style
- **ESLint Configuration**: Uses Next.js core web vitals and TypeScript rules as base
- **TypeScript**: Strict type checking enabled, but with pragmatic exceptions:
  - `@typescript-eslint/no-explicit-any`: Allowed in API routes, lib utilities, and admin components for flexibility
  - `@typescript-eslint/no-unsafe-*`: Relaxed in backend code for practical API integrations
- **File Organization**:
  - PascalCase for React components (e.g., `ProductCard.tsx`)
  - camelCase for utilities and hooks (e.g., `useAuth.ts`)
  - kebab-case for file names (e.g., `create-product-form.tsx`)
- **Import Style**:
  - Absolute imports with `@/` alias for internal modules
  - External dependencies first, then internal imports
  - Type-only imports for TypeScript types
- **JSX**:
  - Multi-line props on separate lines
  - Self-closing tags when no children
  - `react/no-unescaped-entities` relaxed in admin components for content management
- **Error Handling**:
  - Try-catch blocks with minimal error logging in API routes
  - Graceful error handling in admin interfaces
- **Naming Conventions**:
  - Database: snake_case (Prisma convention)
  - API endpoints: RESTful with kebab-case
  - Environment variables: SCREAMING_SNAKE_CASE

### Architecture Patterns
- **Next.js App Router**: File-based routing with nested layouts and loading states
- **Component Architecture**:
  - `src/components/ui/`: Reusable UI primitives (shadcn/ui style)
  - `src/components/admin/`: Admin-specific components
  - `src/components/tiptap*/`: Rich text editor components
  - Feature-based organization for complex components
- **State Management**:
  - React Context for global state (CartContext, ThemeProvider)
  - Local component state with useState/useReducer
  - Server state with React Query/SWR (not currently implemented)
- **API Design**:
  - RESTful API routes under `src/app/api/`
  - Route handlers for CRUD operations
  - Middleware for authentication (`middleware.ts`)
- **Database Layer**:
  - Prisma ORM with generated client
  - Repository pattern through Prisma models
  - Database-first schema design with migrations
- **Authentication**:
  - JWT-based auth with httpOnly cookies
  - Role-based access (ADMIN, SUPER_ADMIN)
  - Password hashing with bcrypt
- **File Storage**:
  - MinIO/S3 for cloud storage
  - Local filesystem fallback for development
- **Error Boundaries**: Not currently implemented, errors handled at component level

### Testing Strategy
- **Framework**: Jest with Next.js integration for full-stack testing
- **Test Environment**: Node.js environment for API route testing
- **Coverage**: V8 coverage provider with coverage reporting
- **Setup**: Custom setup file (`jest.setup.ts`) for test configuration
- **Module Mapping**: `@/` alias support for import resolution
- **Transform Patterns**: Special handling for `jose` library (JWT operations)
- **Test Scripts**:
  - `npm test`: Standard test run
  - `npm run test:watch`: Watch mode for development
  - `npm run test:coverage`: Coverage report generation
  - `npm run test:ci`: CI-optimized test run
- **Test Organization**:
  - API route tests in `__tests__/` directories alongside implementation
  - Unit tests for utilities and business logic
  - Integration tests for API endpoints
- **Mocking**: Jest mocking for external dependencies and database operations
- **CI Integration**: Automated testing in CI pipeline with coverage requirements

### Git Workflow
- **Branching Strategy**: Git Flow with development and main branches
- **Base Branch**: All feature/bugfix branches must branch from `development` (not `main`)
- **Branch Naming**:
  - `feat/nama-fitur`: New features
  - `fix/nama-perbaikan`: Bug fixes
  - `chore/nama-tugas`: Non-functional tasks (dependency updates)
  - `docs/nama-dokumentasi`: Documentation changes
  - `refactor/nama-refactor`: Code refactoring
- **Pull Request Process**:
  - Create PR from feature branch to `development`
  - Required code review before merge
  - No self-merge policy
  - PR description must include: summary, changes, issue links, test steps
- **Commit Conventions**:
  - Clear, descriptive commit messages
  - English language for consistency
  - Structured format preferred
- **Fork Workflow**:
  - Contributors fork the repository
  - Development happens on forked `development` branch
  - Regular upstream synchronization required
- **Release Process**:
  - `development` branch for ongoing work
  - `main` branch for stable releases
  - Maintainers handle merge from `development` to `main`
- **Code Review Requirements**:
  - Build and lint checks must pass
  - Critical warnings must be addressed
  - Functional testing required before approval

## Domain Context
### E-commerce Concepts
- **Product Catalog**: Products organized by categories with variants (size, flavor, etc.), pricing, and inventory management
- **Shopping Cart**: Session-based cart storage with item quantity management and price calculations
- **Order Lifecycle**: Order creation → payment → fulfillment → delivery → completion
- **Inventory Management**: Stock tracking, low-stock alerts, and out-of-stock handling
- **Pricing Strategy**: Base pricing with discount vouchers (percentage or fixed amount)

### Food Delivery Domain
- **Pre-orders**: Products that require advance ordering (baked goods, specialty items)
- **Delivery Zones**: Geographic areas with different delivery fees and timeframes
- **Driver Assignment**: In-house delivery team management with driver tracking
- **Food Safety**: Proper handling requirements for perishable food items
- **Packaging**: Special packaging needs for food delivery (temperature control, spill prevention)

### Business Operations
- **Partner Network**: External vendors/partners supplying products to the platform
- **Admin Roles**: Hierarchical admin system (ADMIN, SUPER_ADMIN) for different access levels
- **Analytics Dashboard**: Business metrics tracking (sales, orders, customer behavior)
- **Voucher System**: Promotional codes with usage limits and expiration dates
- **Payment Processing**: Multiple payment methods with transaction tracking

### Key Business Rules
- Orders can have multiple products with different quantities
- Delivery is 1:1 with orders (one delivery per order)
- Products can have multiple images (main image + additional photos)
- Vouchers apply discounts at order level (before delivery fees)
- Pre-order rules define advance ordering requirements

## Important Constraints
### Technical Constraints
- **Database**: PostgreSQL requirement (no other databases supported)
- **Authentication**: JWT-based with cookie storage (no session-based auth)
- **File Storage**: MinIO/S3 compatible (local filesystem fallback only for development)
- **Environment**: Node.js runtime with specific dependency versions
- **Browser Support**: Modern browsers with JavaScript enabled

### Business Constraints
- **Market Focus**: Indonesian market with local delivery services
- **Payment Methods**: Must support multiple Indonesian payment providers
- **Delivery Scope**: In-house delivery team (no third-party logistics integration yet)
- **Product Types**: Food and snack focus with pre-order capabilities
- **Admin Hierarchy**: Two-tier admin system (ADMIN/SUPER_ADMIN roles)

### Regulatory Constraints
- **Food Safety**: Compliance with Indonesian food handling regulations
- **Consumer Protection**: Order cancellation and refund policies
- **Data Privacy**: Customer data protection requirements
- **Payment Security**: PCI DSS compliance for payment processing
- **Business Licensing**: Food service and e-commerce licensing requirements

### Operational Constraints
- **Order Processing**: Real-time inventory updates required
- **Delivery Timeframes**: SLA commitments for delivery windows
- **Customer Support**: 24/7 support requirements for food orders
- **Quality Control**: Product quality assurance processes
- **Partner Management**: Vendor onboarding and quality standards

## External Dependencies
### Storage Services
- **MinIO**: S3-compatible object storage for product images and file uploads
  - Endpoint: Configurable via `MINIO_ENDPOINT`
  - Bucket: Configurable via `MINIO_BUCKET`
  - Fallback: Local filesystem storage when MinIO unavailable
  - Optional AWS S3 SDK integration for cloud deployment

### Communication Services
- **GOWA (WhatsApp Gateway)**: WhatsApp integration for order notifications
  - API URL: `GOWA_API_URL` (default: http://localhost:3002)
  - Admin credentials: `GOWA_ADMIN` and `GOWA_PASSWORD`
  - Group messaging: `GOWA_GROUP_ID` for broadcast notifications
  - Optional service - platform functions without it

### Database Services
- **PostgreSQL**: Primary database for all application data
  - Connection: `DATABASE_URL` with full connection string
  - Shadow database: `SHADOW_DATABASE_URL` for Prisma migrations
  - Docker support: Pre-configured docker-compose.yml for local development

### Development Tools
- **Docker**: Containerized development environment
  - PostgreSQL container with persistent volumes
  - MinIO container for file storage
  - Optional pgAdmin for database management
- **Prisma Studio**: Database GUI for development and debugging
- **pgAdmin**: Optional database administration interface

### Environment Configuration
- **Development**: Local PostgreSQL, MinIO, and GOWA services
- **Production**: Cloud PostgreSQL, S3-compatible storage, external WhatsApp gateway
- **CI/CD**: Automated testing with Jest, linting with ESLint
