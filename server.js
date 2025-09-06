const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3001;

// Permet de servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static("public"));
// Permet de traiter le corps des requêtes en JSON
app.use(express.json());

// Routes pour lire les données
app.get("/api/employes", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data", "employes.json"),
      "utf-8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Erreur de lecture des employés." });
  }
});

app.get("/api/productions", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data", "productions.json"),
      "utf-8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Erreur de lecture de la production." });
  }
});

app.get("/api/paiements", async (req, res) => {
  try {
    const data = await fs.readFile(
      path.join(__dirname, "data", "paiements.json"),
      "utf-8"
    );
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ message: "Erreur de lecture des paiements." });
  }
});

// Routes pour écrire les données
app.post("/api/employes", async (req, res) => {
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "employes.json"),
      JSON.stringify(req.body, null, 2)
    );
    res.status(200).json({ message: "Employés mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur de sauvegarde des employés." });
  }
});

app.post("/api/productions", async (req, res) => {
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "productions.json"),
      JSON.stringify(req.body, null, 2)
    );
    res.status(200).json({ message: "Production mise à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur de sauvegarde de la production." });
  }
});

app.post("/api/paiements", async (req, res) => {
  try {
    await fs.writeFile(
      path.join(__dirname, "data", "paiements.json"),
      JSON.stringify(req.body, null, 2)
    );
    res.status(200).json({ message: "Paiements mis à jour avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur de sauvegarde des paiements." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
