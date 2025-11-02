const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve static files

// API Routes
app.use('/api/upload', require('./api/upload'));
app.use('/api/files', require('./api/files'));

// File serving route (for pretty URLs)
app.get('/:fileId', (req, res) => {
    res.redirect(`/api/files/${req.params.fileId}`);
});

// Cleanup expired files on startup
cleanupExpiredFiles();

// Start server
app.listen(PORT, () => {
    console.log(`🚀 UltraUpload running on port ${PORT}`);
    console.log(`📁 Upload files at: http://localhost:${PORT}`);
});

function cleanupExpiredFiles() {
    try {
        const dbPath = path.join(__dirname, 'database.json');
        if (!fs.existsSync(dbPath)) return;

        const database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        const now = new Date();
        
        database.files = database.files.filter(file => {
            if (file.expiryDate && new Date(file.expiryDate) < now) {
                // Delete expired file
                const filePath = path.join(__dirname, 'uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                return false;
            }
            return true;
        });

        fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
        console.log('🧹 Cleaned up expired files');
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}
