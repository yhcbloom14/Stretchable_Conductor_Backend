# LeafyLab Platform

# **Refactor**
## Uncertainty & Feasibility
- [ ] If isUncertainty / isFeasibliity in columns must have cutoffs
## Pages
- [ ] Metadata
## lib/types
- [ ] Use as basis for API contracts / schemas

# **Testing**
- [ ] Change Password
  - [ ] Invalid Hash
  - [ ] Altered Hash

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/en/download) (Ensure you have the latest LTS version)
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) (Node package manager)

## Installation

1. **Clone the Repository**

   Clone the project repository to your local machine. We recommend using [GitHub Desktop](https://desktop.github.com/) for a user-friendly experience. Alternatively, you can use the command line:

   ```bash
   git clone <repository-url>
   cd LeafyLabPlatform
   ```

2. **Install Dependencies**

   Use `npm` to install all necessary packages:

   ```bash
   npm install
   ```

## Running the Application

To start the development server, execute the following command:

```bash
npm run dev
```

This will launch the application on [http://localhost:3000](http://localhost:3000).

## Additional Scripts

- **Build the Application**

  To create an optimized production build, run:

  ```bash
  npm run build
  ```

- **Start the Production Server**

  After building the application, you can start the production server with:

  ```bash
  npm run start
  ```

- **Lint the Code**

  To check for code quality and style issues, use:

  ```bash
  npm run lint
  ```
