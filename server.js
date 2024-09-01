// importo i moduli
const express = require("express"); // FW
const cors = require("cors");
const bcrypt = require("bcryptjs"); // Hashing psw
const jwt = require("jsonwebtoken"); // JWT
const { sequelize, User, Diary, Trip, Day } = require("./models"); // Importo tutto da models
const fs = require("fs");
const path = require("path");
const { where } = require("sequelize");

const app = express();
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ limit: "10mb", extended: true })); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "JWT"; // Chiave segreta per JWT, ora presa da variabili d'ambiente

// Testing
app.get("/test", async (req, res) => {
  try {
    const users = await User.findAll();
    console.log(users);
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Rotta di registrazione
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    // Crea un diario di default per l'utente
    await Diary.create({
      UserId: user.id, // Associa il diario all'utente
      title: "Adventure Diary",
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).json({ error: "Error registering user" });
  }
});

// Rotta di login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Recupera l'utente dal database in base all'email
    const user = await User.findOne({ where: { email } });
    console.log(user);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Confronta la password inserita con quella salvata nel database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Crea il token JWT
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    // Invia il token e lo username come risposta
    res.json({
      token,
      username: user.username, // Includi lo username nella risposta
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Error logging in" });
  }
});

// Middleware per autenticare il token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1]; // Ottiene il token dall'intestazione Authorization
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Rotta per ottenere il diario di viaggio dell'utente loggato
app.get("/diary", authenticateToken, async (req, res) => {
  try {
    const diaries = await Diary.findAll({
      where: { UserId: req.user.id },
      include: {
        model: Trip,
        include: Day,
      },
    });
    res.json({ diaries });
  } catch (err) {
    console.error("Error fetching diaries:", err);
    res.status(500).json({ error: "Error fetching diaries" });
  }
});

// Nuovo viaggio
app.post("/trips", authenticateToken, async (req, res) => {
  const { diaryId, name, startDate, endDate } = req.body;

  try {
    const diary = await Diary.findOne({
      where: { id: diaryId, UserId: req.user.id },
    });
    if (!diary) {
      return res
        .status(404)
        .json({ error: "Diary not found or not owned by the user" });
    }

    const trip = await Trip.create({
      name,
      startDate,
      endDate,
      DiaryId: diaryId,
    });
    res.status(201).json({ trip });
  } catch (err) {
    console.error("Error creating trip:", err);
    res.status(500).json({ error: "Error creating trip" });
  }
});

// Dettagli di x viaggio
app.get("/trips/:tripId", authenticateToken, async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findOne({
      where: { id: tripId },
      include: {
        model: Diary,
        where: { UserId: req.user.id },
      },
      include: [Day], // Include i giorni di viaggio
    });

    if (!trip) {
      return res
        .status(404)
        .json({ error: "Trip not found or not owned by the user" });
    }

    res.json({ trip });
  } catch (err) {
    console.error("Error fetching trip details:", err);
    res.status(500).json({ error: "Error fetching trip details" });
  }
});

// Crea giornata
app.post("/days", authenticateToken, async (req, res) => {
  const { tripId, date, description, location, latitude, longitude, photoUrl } =
    req.body;

  try {
    const trip = await Trip.findOne({
      where: {
        id: tripId,
      },
      include: {
        model: Diary,
        where: { UserId: req.user.id },
      },
    });

    if (!trip) {
      return res
        .status(404)
        .json({ error: "Trip not found or not owned by the user" });
    }
    let photoFileNames = [];
    if (Array.isArray(photoUrl) && photoUrl.length > 0) {
      for (const photo of photoUrl) {
        const getRandomInt = (max) => Math.floor(Math.random() * max);
        const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, "");
        const photoFileName = `photo-${Date.now()}-${getRandomInt(10000)}.png`; // Nome 
        const photoPath = path.join(__dirname, "uploads", photoFileName); // Path

        fs.writeFileSync(photoPath, base64Data, "base64");

        photoFileNames.push(`/uploads/${photoFileName}`);
      }
    }
    const day = await Day.create({
      date,
      description,
      location,
      latitude,
      longitude,
      photoUrl: photoFileNames.length > 0 ? photoFileNames : null,
      TripId: tripId,
    });
    res.status(201).json({ day });
  } catch (err) {
    console.error("Error adding day:", err);
    res.status(500).json({ error: "Error adding day" });
  }
});

// Modifica
app.patch("/days/:dayId", authenticateToken, async (req, res) => {
  const { dayId } = req.params;
  const { date, description, location, latitude, longitude, photoUrl } =
    req.body || {};

  try {
    const day = await Day.findOne({
      where: { id: dayId },
      include: {
        model: Trip,
        include: {
          model: Diary,
          where: { UserId: req.user.id },
        },
      },
    });
    if (!day) {
      return res
        .status(404)
        .json({ error: "Day not found or not owned by the user" });
    }

    let photoFileNames = day.photoUrl || [];

    if (Array.isArray(photoUrl) && photoUrl.length > 0) {
      for (const photo of photoUrl) {
        const getRandomInt = (max) => Math.floor(Math.random() * max);
        const base64Data = photo.replace(/^data:image\/[a-z]+;base64,/, "");
        const photoFileName = `photo-${Date.now()}-${getRandomInt(10000)}.png`;
        const photoPath = path.join(__dirname, "uploads", photoFileName);

        fs.writeFileSync(photoPath, base64Data, "base64");

        photoFileNames.push(`/uploads/${photoFileName}`);
      }
    }
    photoFileNames = Array.from(new Set(photoFileNames)); // Set, rimuove eventuali duplicati
    console.log("PhotoUrl da aggiornare :", photoFileNames);
    console.log("Tipo di dato di photoFileNames:", typeof photoFileNames);

    console.log("Updating day with:", {
      date: date || day.date,
      description: description || day.description,
      location: location || day.location,
      latitude: latitude || day.latitude,
      longitude: longitude || day.longitude,
      photoUrl: photoFileNames,
    });
    const updatedData = {
      date: date || day.date,
      description: description || day.description,
      location: location || day.location,
      latitude: latitude || day.latitude,
      longitude: longitude || day.longitude,
      photoUrl: photoFileNames.length > 0 ? photoFileNames : day.photoUrl,
    };
    await day.update(updatedData);

    const updatedDay = await Day.findOne({ where: { id: dayId } });
    res.json({ message: "Day updated successfully", day: updatedDay });
  } catch (err) {
    console.error("Error updating day:", err);
    res.status(500).json({ error: "Error updating day" });
  }
});

// Rotta per dettagli giorno
app.get("/day-detail/:tripId/:dayId", authenticateToken, async (req, res) => {
  const { tripId, dayId } = req.params;

  try {
    const day = await Day.findOne({
      where: { id: dayId, TripId: tripId },
    });

    if (!day) {
      return res
        .status(404)
        .json({ error: "Day not found or not associated with the trip" });
    }

    res.json({ day });
  } catch (err) {
    console.error("Error fetching day details:", err);
    res.status(500).json({ error: "Error fetching day details" });
  }
});

// Rotte per Eliminare ...

// Giorno
app.delete("/days/:dayId", authenticateToken, async (req, res) => {
  const { dayId } = req.params;

  try {
    const day = await Day.findOne({
      where: { id: dayId },
      include: {
        model: Trip,
        include: {
          model: Diary,
          where: { UserId: req.user.id },
        },
      },
    });

    if (!day) {
      return res
        .status(404)
        .json({ error: "Day not found or not owned by the user" });
    }

    await day.destroy();

    res.json({ message: "Day deleted successfully" });
  } catch (err) {
    console.error("Error deleting day:", err);
    res.status(500).json({ error: "Error deleting day" });
  }
});

// Viaggio
app.delete("/trips/:tripId", authenticateToken, async (req, res) => {
  const { tripId } = req.params;

  try {
    const trip = await Trip.findOne({
      where: { id: tripId },
      include: {
        model: Diary,
        where: { UserId: req.user.id },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: "Trip not found or not owned by the user" });
    }

    await Day.destroy({ where: { TripId: tripId } });
    await trip.destroy();

    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    console.error("Error deleting trip:", err);
    res.status(500).json({ error: "Error deleting trip" });
  }
});


// Avvio del server
const PORT = process.env.PORT || 5001;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log("Connection to MySQL has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});
