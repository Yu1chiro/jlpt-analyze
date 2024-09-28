import express from 'express';
import dotenv from 'dotenv';
import path from 'path';

const app = express();

// Memuat variabel dari file .env
dotenv.config();

// Menentukan folder public untuk melayani file statis (HTML, CSS, JS)
const __dirname = path.resolve(); // Untuk mendefinisikan __dirname dengan ES6
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint untuk mengambil URL API dengan API Key yang aman
app.get('/api/geminiApiUrl', (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    res.json({ geminiApiUrl: apiUrl });
});

// Menangani root path dan mengirimkan file HTML dari folder public
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port http://localhost:${PORT}`);
});
