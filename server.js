const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));

// ──────────── API Routes ────────────

// List all saved resumes
app.get('/api/resumes', (req, res) => {
    try {
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
        const resumes = files.map(file => {
            const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf-8'));
            return {
                id: data.id,
                name: data.personal?.fullName || 'Untitled Resume',
                title: data.personal?.jobTitle || '',
                updatedAt: data.updatedAt || data.createdAt
            };
        });
        // Sort by most recently updated
        resumes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        res.json(resumes);
    } catch (err) {
        console.error('Error listing resumes:', err);
        res.status(500).json({ error: 'Failed to list resumes' });
    }
});

// Get a specific resume
app.get('/api/resumes/:id', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        res.json(data);
    } catch (err) {
        console.error('Error reading resume:', err);
        res.status(500).json({ error: 'Failed to read resume' });
    }
});

// Create a new resume
app.post('/api/resumes', (req, res) => {
    try {
        const id = uuidv4();
        const resume = {
            id,
            ...req.body,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(resume, null, 2));
        res.status(201).json(resume);
    } catch (err) {
        console.error('Error creating resume:', err);
        res.status(500).json({ error: 'Failed to create resume' });
    }
});

// Update an existing resume
app.put('/api/resumes/:id', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const updated = {
            ...existing,
            ...req.body,
            id: req.params.id,
            updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2));
        res.json(updated);
    } catch (err) {
        console.error('Error updating resume:', err);
        res.status(500).json({ error: 'Failed to update resume' });
    }
});

// Delete a resume
app.delete('/api/resumes/:id', (req, res) => {
    try {
        const filePath = path.join(DATA_DIR, `${req.params.id}.json`);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Resume not found' });
        }
        fs.unlinkSync(filePath);
        res.json({ message: 'Resume deleted' });
    } catch (err) {
        console.error('Error deleting resume:', err);
        res.status(500).json({ error: 'Failed to delete resume' });
    }
});

// Fallback — serve index.html for any non-API route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n  🚀 Resume Maker running at http://localhost:${PORT}\n`);
});
