/**
 * server.js
 */
const express = require("express");
const path = require("path");
const { Pool } = require("pg");

// Pool-Konfiguration für PostgreSQL
// Auf Render bekommst du in process.env.DATABASE_URL
// deine Datenbank-Verbindungs-URL bereitgestellt.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware zum Parsen von JSON-Requests
app.use(express.json());

// Statische Dateien aus dem Ordner "public" ausliefern
app.use(express.static(path.join(__dirname, "public")));

/**
 * GET /api/todos
 * Lädt alle Einträge aus der Datenbank und gibt sie als JSON zurück.
 */
app.get("/api/todos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM todos ORDER BY id ASC;");
    res.json(result.rows);
  } catch (err) {
    console.error("Fehler bei GET /api/todos:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

/**
 * POST /api/todos
 * Erwartet im Body ein JSON mit den Feldern:
 * {
 *   von, bis,
 *   muell, muellDone, muellDoneBy,
 *   hennen, hennenDone, hennenDoneBy,
 *   auto, autoDone, autoDoneBy,
 *   biomuell, biomuellDone, biomuellDoneBy,
 *   strom, stromDone, stromDoneBy,
 *   andere, andereDone, andereDoneBy
 * }
 * Legt einen neuen Datensatz in der DB an.
 */
app.post("/api/todos", async (req, res) => {
  try {
    const t = req.body;
    const query = `
      INSERT INTO todos (
        von, bis,
        muell, muellDone, muellDoneBy,
        hennen, hennenDone, hennenDoneBy,
        auto, autoDone, autoDoneBy,
        biomuell, biomuellDone, biomuellDoneBy,
        strom, stromDone, stromDoneBy,
        andere, andereDone, andereDoneBy
      )
      VALUES ($1,$2, $3,$4,$5, $6,$7,$8, $9,$10,$11, $12,$13,$14, $15,$16,$17, $18,$19,$20)
      RETURNING *;
    `;
    const values = [
      t.von, t.bis,
      t.muell, t.muellDone, t.muellDoneBy,
      t.hennen, t.hennenDone, t.hennenDoneBy,
      t.auto, t.autoDone, t.autoDoneBy,
      t.biomuell, t.biomuellDone, t.biomuellDoneBy,
      t.strom, t.stromDone, t.stromDoneBy,
      t.andere, t.andereDone, t.andereDoneBy
    ];
    const result = await pool.query(query, values);
    res.json(result.rows[0]); // gibt das neu erstellte Todo zurück
  } catch (err) {
    console.error("Fehler bei POST /api/todos:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

/**
 * PUT /api/todos/:id
 * Aktualisiert einen bestehenden Datensatz in der DB.
 */
app.put("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const t = req.body;
    const query = `
      UPDATE todos SET
        von=$1, bis=$2,
        muell=$3, muellDone=$4, muellDoneBy=$5,
        hennen=$6, hennenDone=$7, hennenDoneBy=$8,
        auto=$9, autoDone=$10, autoDoneBy=$11,
        biomuell=$12, biomuellDone=$13, biomuellDoneBy=$14,
        strom=$15, stromDone=$16, stromDoneBy=$17,
        andere=$18, andereDone=$19, andereDoneBy=$20
      WHERE id=$21
      RETURNING *;
    `;
    const values = [
      t.von, t.bis,
      t.muell, t.muellDone, t.muellDoneBy,
      t.hennen, t.hennenDone, t.hennenDoneBy,
      t.auto, t.autoDone, t.autoDoneBy,
      t.biomuell, t.biomuellDone, t.biomuellDoneBy,
      t.strom, t.stromDone, t.stromDoneBy,
      t.andere, t.andereDone, t.andereDoneBy,
      id
    ];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fehler bei PUT /api/todos:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

/**
 * DELETE /api/todos/:id
 * Entfernt einen Eintrag aus der Tabelle.
 */
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM todos WHERE id=$1 RETURNING *;", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Fehler bei DELETE /api/todos:", err);
    res.status(500).json({ error: "Datenbankfehler" });
  }
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
