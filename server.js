import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const port = 5000;

// Middleware for serving static files
app.use(express.static('public'));
app.use(express.json());

// File upload setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the file extension
    }
});

const upload = multer({ storage });

// Routes
app.get('/songs', (req, res) => {
    const songs = fs.readdirSync('uploads/').map(file => {
        return {
            title: path.basename(file, path.extname(file)),
            artist: 'Unknown', // You can modify this as needed
            src: `/uploads/${file}`
        };
    });
    res.json(songs);
});

app.post('/upload', upload.single('song'), (req, res) => {
    res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
