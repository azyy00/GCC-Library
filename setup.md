# Library Management System Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- Git

## Database Setup

1. **Install MySQL** (if not already installed)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP for easy setup

2. **Create Database**
   ```sql
   -- Run the schema.sql file in your MySQL client
   -- Or copy and paste the contents of database/schema.sql
   ```

3. **Update Database Configuration**
   - Edit `backend/config/db.js`
   - Update the connection details if needed:
     ```javascript
     const connection = mysql.createConnection({
         host: 'localhost',
         user: 'root',           // Your MySQL username
         password: '',           // Your MySQL password
         database: 'library_attendance'
     });
     ```

## Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-restart:
   npm run dev
   ```

   The backend will run on `http://localhost:3001`

## Frontend Setup

1. **Navigate to project root**
   ```bash
   cd ..  # (if you're in the backend directory)
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend**
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Development Mode (Both servers)

To run both frontend and backend simultaneously:

```bash
npm run dev
```

This will start both servers using concurrently.

## Frontend Deployment On Vercel

Use this option when the frontend should be hosted on Vercel while the backend stays on a separate Node host.

### Requirements
- A public backend URL, for example `https://your-backend-domain.example`
- The backend must expose the API under `/api`
- The backend must allow requests from your Vercel frontend domain

### Vercel Settings

1. Import this project into Vercel
2. Set the project root to the repository root:
   ```text
   library-app-main
   ```
3. Confirm these build settings:
   ```text
   Framework Preset: Create React App
   Build Command: npm run build
   Output Directory: build
   Node.js Version: 20.x
   ```
4. Add this environment variable in Vercel:
   ```text
   REACT_APP_API_URL=https://your-backend-domain.example/api
   ```
5. Deploy the project

### Notes
- `vercel.json` includes a rewrite so React Router routes like `/attendance` and `/active` work on refresh
- Uploaded student profile images are still served from the backend host, not Vercel
- The sample value is also available in `.env.example`

## Backend Deployment On Railway

Use Railway when you want the backend and MySQL database on the same host platform while keeping the frontend on Vercel.

### Railway Project Layout

1. Create a new Railway project
2. Add a service from your GitHub repository
3. Select this repository and set the service root directory to:
   ```text
   backend
   ```
4. Railway should auto-detect this as a Node.js app
5. Confirm the backend start command is:
   ```text
   npm start
   ```

### Add A Railway MySQL Service

1. In the same Railway project, add a MySQL database service
2. Wait for Railway to finish provisioning it
3. In the backend service variables, create these reference variables:
   ```text
   DB_HOST=${{MySQL.MYSQLHOST}}
   DB_PORT=${{MySQL.MYSQLPORT}}
   DB_USER=${{MySQL.MYSQLUSER}}
   DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
   DB_NAME=${{MySQL.MYSQLDATABASE}}
   DB_CONNECTION_LIMIT=10
   ```

If your Railway MySQL service has a different name, replace `MySQL` with that service name.

### Profile Images On Railway

Railway does not provide durable local disk storage for uploaded files. Keep using your existing Vercel Blob store for profile images by setting:

```text
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

The backend now passes that token explicitly, so Vercel Blob uploads work even when the backend is deployed outside Vercel.

### Import Existing Local Data

If your `library_attendance` database currently lives in XAMPP or another local MySQL instance, export it locally and import it into Railway MySQL before testing the deployed backend.

### Verify The Railway Backend

After deployment, test:

```text
https://your-railway-backend-domain/api/health
https://your-railway-backend-domain/api/health/db
```

The `/api/health/db` endpoint should report `database: "reachable"` when the Railway database is connected correctly.

### Connect The Frontend

Once the Railway backend is live, set this in the frontend Vercel project:

```text
REACT_APP_API_URL=https://your-railway-backend-domain/api
```

## Backend Deployment On Vercel

Use a separate Vercel project for the backend and set the root directory to:

```text
backend
```

### Backend Vercel Settings

1. Import the same GitHub repository into Vercel again
2. Set the project root directory to:
   ```text
   backend
   ```
3. Confirm these settings:
   ```text
   Framework Preset: Other
   Install Command: npm install
   Build Command: leave empty
   Output Directory: leave empty
   Node.js Version: 20.x
   ```

### Required Backend Environment Variables

Add these in the backend Vercel project:

```text
DB_HOST=your-mysql-host
DB_PORT=3306
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=library_attendance
DB_CONNECTION_LIMIT=10
```

### Profile Image Uploads On Vercel

This backend now supports Vercel Blob for profile images. Add this environment variable if you want uploads to persist:

```text
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token
```

Without a Blob token, profile uploads still work locally, but a Vercel deployment should not rely on local disk storage.

### Frontend Connection

After the backend is deployed, take the backend domain and set the frontend Vercel environment variable to:

```text
REACT_APP_API_URL=https://your-backend-vercel-domain/api
```

## Features

### ✅ Completed Features
- Student Registration
- Attendance Check-in/Check-out
- Dashboard with Statistics
- Active Visitors Management
- Responsive UI with Bootstrap

### 🎯 Key Components
- **Dashboard**: Overview of library statistics
- **Student Registration**: Add new students to the system
- **Attendance Log**: Check students in/out
- **Active Visitors**: Manage currently checked-in students

### 🔧 API Endpoints
- `GET /api/students` - Get all students
- `POST /api/students` - Register new student
- `GET /api/students/search?q=query` - Search students
- `POST /api/attendance/checkin` - Check in student
- `POST /api/attendance/checkout/:id` - Check out student
- `GET /api/attendance/active` - Get active visitors
- `GET /api/stats` - Get dashboard statistics

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure MySQL is running
   - Check database credentials in `backend/config/db.js`
   - Verify database `library_attendance` exists

2. **Port Already in Use**
   - Backend runs on port 3001
   - Frontend runs on port 3000
   - Change ports in respective configuration files if needed

3. **CORS Issues**
   - Backend has CORS enabled for all origins
   - If issues persist, check browser console for errors

### Testing the System

1. Start both servers
2. Open `http://localhost:3000`
3. Register a new student
4. Check in the student
5. View active visitors
6. Check out the student
7. Check dashboard for updated statistics

## Next Steps

- Add user authentication
- Implement data validation
- Add more detailed reporting
- Export functionality
- Email notifications
