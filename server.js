import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Set up __dirname and __filename for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
import { MongoClient, ServerApiVersion } from 'mongodb';
const uri = "mongodb+srv://taranpreetsinghrababi:Taranpreet@musicplayer.wio36.mongodb.net/?retryWrites=true&w=majority&appName=MusicPlayer";
let collection;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const database=client.db("Music_player");
    collection=database.collection("songs_list");
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if connection fails
}
}
run().catch(console.dir);

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Upload song endpoint
app.post('/upload', upload.single('song'), async (req, res) => {
    //const collection = await connectToDatabase(); // Get collection on each request
    try {
        // Check if the file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        console.log('File uploaded:', req.file);  // Log the uploaded file details

        // Create a new song document
        const newSong = {
            title: req.body.title,
            artist: req.body.artist,
            src: `http://localhost:${PORT}/uploads/${req.file.filename}`,
        };

        // Save the song to the database
        const result = await collection.insertOne(newSong);
        console.log('Saved to DB:', result.ops[0]);  // Log success message

        // Send response
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error('Error saving song to database:', error);
        res.status(500).json({ error: 'Error uploading song.' });
    }
});

// Fetch songs endpoint
app.get('/songs', async (req, res) => {
    //const collection = await connectToDatabase(); // Get collection on each request
    try {
        const songs = await collection.find({}).toArray();

        if (!songs || songs.length === 0) {
            return res.status(404).json({ message: 'No songs found.' });
        }

        res.json(songs);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: 'Error fetching songs' });
    }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
