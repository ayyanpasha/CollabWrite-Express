import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import connectToDb from './db.js';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth.js';
import documentRequestRoutes from './routes/documentRequest.js';
import documentPermissionRoutes from './routes/documentPermission.js';
import documentAdminRoutes from './routes/documentAdmin.js';
import documentRoutes from './routes/document.js';


// Connect to the database
connectToDb();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Increase payload size limit for JSON requests
app.use(bodyParser.json({ limit: '1gb' })); // Adjust the limit as needed

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/document/request', documentRequestRoutes);
app.use('/api/document/permission', documentPermissionRoutes);
app.use('/api/document/admin', documentAdminRoutes);
app.use('/api/document', documentRoutes);

// Start the server
const PORT = process.env.EXPRESS_PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
