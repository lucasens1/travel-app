// importo i moduli
const express = require('express'); // FW
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Hashing psw
const jwt = require('jsonwebtoken'); // JWT
const { sequelize, User, Diary, Trip, Day } = require('./models'); // Importo tutto da models

const app = express();
app.use(cors());
app.use(express.json()); // Middleware per parsare il corpo delle richieste in formato JSON

const JWT_SECRET = process.env.JWT_SECRET || 'JWT'; // Chiave segreta per JWT, ora presa da variabili d'ambiente

app.get('/test-connection', async (req, res) => {
    try {
        const users = await User.findAll();
        console.log(users)
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Rotta di registrazione
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, password: hashedPassword });
        // Crea un diario di default per l'utente
        await Diary.create({ 
            UserId: user.id, // Associa il diario all'utente
            title: 'Adventure Diary'
        });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Rotta di login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Recupera l'utente dal database in base all'email
        const user = await User.findOne({ where: { email } });
        console.log(user)
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Confronta la password inserita con quella salvata nel database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Crea il token JWT
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });

        // Invia il token e lo username come risposta
        res.json({ 
            token, 
            username: user.username // Includi lo username nella risposta
        });
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Middleware per autenticare il token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Ottiene il token dall'intestazione Authorization
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Rotta per ottenere il diario di viaggio dell'utente loggato
app.get('/diary', authenticateToken, async (req, res) => {
    try {
        const diaries = await Diary.findAll({
            where: { UserId: req.user.id },
            include: {
                model: Trip,
                include: Day
            }
        });
        res.json({ diaries });
    } catch (err) {
        console.error('Error fetching diaries:', err);
        res.status(500).json({ error: 'Error fetching diaries' });
    }
});

// Rotta per creare un nuovo viaggio
app.post('/trips', authenticateToken, async (req, res) => {
    const { diaryId, name, startDate, endDate } = req.body;

    try {
        // Verifica che il diario esista e appartenga all'utente
        const diary = await Diary.findOne({ where: { id: diaryId, UserId: req.user.id } });
        if (!diary) {
            return res.status(404).json({ error: 'Diary not found or not owned by the user' });
        }

        const trip = await Trip.create({
            name,
            startDate,
            endDate,
            DiaryId: diaryId
        });
        res.status(201).json({ trip });
    } catch (err) {
        console.error('Error creating trip:', err);
        res.status(500).json({ error: 'Error creating trip' });
    }
});

// Rotta per aggiungere un giorno a un viaggio
app.post('/days', authenticateToken, async (req, res) => {
    const { tripId, date, description, location, photoUrl } = req.body;

    try {
        // Verifica che il viaggio esista e appartenga all'utente
        const trip = await Trip.findOne({ where: { id: tripId, DiaryId: { [Op.in]: sequelize.literal(`(SELECT id FROM Diaries WHERE UserId=${req.user.id})`) } } });
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found or not owned by the user' });
        }

        const day = await Day.create({
            date,
            description,
            location,
            photoUrl,
            TripId: tripId
        });
        res.status(201).json({ day });
    } catch (err) {
        console.error('Error adding day:', err);
        res.status(500).json({ error: 'Error adding day' });
    }
});

// Avvio del server
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await sequelize.authenticate();
        console.log('Connection to MySQL has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
