const express = require('express');
const cors = require('cors');
const connectToDb = require('./db.js');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const documentRequestRoutes = require('./routes/documentRequest.js');
const documentPermissionRoutes = require('./routes/documentPermission.js');
const documentAdminRoutes = require('./routes/documentAdmin.js');
const documentRoutes = require('./routes/document');

// Connect to the database
connectToDb();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Increase payload size limit for JSON requests
app.use(bodyParser.json({ limit: '1gb' })); // Adjust the limit as needed

// Other middleware and route handlers...

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).json({ error: 'Invalid JSON payload' });
    } else {
        next();
    }
});

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
