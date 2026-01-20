const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;
const SECRET = "rylmat-secret-2024"; // Zmień na losowy ciąg w produkcji!

app.use(cors());
app.use(express.json());

// Baza danych SQLite
const db = new sqlite3.Database(path.join(__dirname, "users.db"), (err) => {
  if (err) console.error(err);
  else console.log("✓ Połączono z bazą danych SQLite");
});

// Utworzenie tabeli użytkowników
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Endpoint główny (info o API)
app.get("/", (req, res) => {
  res.json({
    message: "✓ Backend Rylmat API",
    endpoints: ["/api/register", "/api/login", "/api/verify"],
  });
});

// Rejestracja
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Hasło musi mieć min. 6 znaków" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword],
      function (err) {
        if (err) {
          if (err.message.includes("UNIQUE")) {
            return res.status(400).json({ error: "Email już istnieje" });
          }
          return res.status(500).json({ error: "Błąd serwera" });
        }
        res.json({ message: "Konto utworzone", userId: this.lastID });
      },
    );
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Logowanie
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email i hasło są wymagane" });
  }

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: "Błąd serwera" });
    }

    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Nieprawidłowy email lub hasło" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, email: user.email });
  });
});

// Weryfikacja tokenu (opcjonalne)
app.get("/api/verify", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Brak tokenu" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    res.json({ valid: true, user: decoded });
  } catch (err) {
    res.status(401).json({ error: "Nieprawidłowy token" });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Serwer działa na http://localhost:${PORT}`);
});
