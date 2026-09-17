# Railway Management System

## Overview
RailConnect is a TypeScript and Express railway operations portal with separate staff and admin access, train management, route monitoring, and booking workflows.

## Project Structure
```
my-project
├── backend
│   └── src
│       ├── app.ts
│       ├── database.ts
│       ├── dataStore.ts
│       ├── components
│       ├── services
│       ├── types
│       └── utils
├── frontend
│   └── public
│       ├── index.html
│       ├── admin-login.html
│       ├── admin.html
│       ├── app.js
│       └── styles.css
├── api
│   └── index.ts
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── .editorconfig
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd my-project
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
To start the application, run:
```
npm start
```
This starts the Express backend and serves the frontend at `http://localhost:3000`.

## Access

- Staff portal: `http://localhost:3000/`
- Admin login: `http://localhost:3000/admin`
- Admin dashboard: `http://localhost:3000/admin/dashboard`

## Build and tests

```bash
npm test
npm run build
```

The `api/index.ts` file is the Vercel serverless adapter. The application is deployed with the frontend and backend from the same project.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.