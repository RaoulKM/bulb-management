// Données de l'application
let employes = [];
let productions = [];
let paiements = [];
const ampoulesParPlaque = 25; // Constante pour le calcul de production

// URL de l'API (votre serveur Node.js)
const API_URL = "http://localhost:3001/api";

// Fonctions utilitaires
function saveEmployes() {
  return fetch(`${API_URL}/employes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employes),
  });
}

function saveProductions() {
  return fetch(`${API_URL}/productions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productions),
  });
}

function savePaiements() {
  return fetch(`${API_URL}/paiements`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paiements),
  });
}

function afficherAlert(message, type) {
  const container = document.querySelector(".alert-container");
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;
  container.appendChild(alertDiv);
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  document.getElementById(tabId).classList.add("active");
  document
    .querySelector(`.nav-tab[onclick="showTab('${tabId}')"]`)
    .classList.add("active");

  if (tabId === "employes") {
    chargerEmployes();
  } else if (tabId === "production") {
    chargerEmployesProduction();
  } else if (tabId === "paiements") {
    chargerPaiements();
  }
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = "block";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// Gestion des employés
document
  .getElementById("form-employe")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = document.getElementById("nom-employe").value;
    const prenom = document.getElementById("prenom-employe").value;
    const cellule = document.getElementById("cellule-employe").value;
    const quota = parseInt(document.getElementById("quota-employe").value);
    const taux = parseFloat(document.getElementById("taux-employe").value);

    const nouvelEmploye = {
      id: employes.length > 0 ? Math.max(...employes.map((e) => e.id)) + 1 : 1,
      nom,
      prenom,
      cellule,
      quota,
      taux,
      statut: "actif",
    };
    employes.push(nouvelEmploye);

    try {
      await saveEmployes();
      afficherAlert("Employé ajouté avec succès!", "success");
      closeModal("modal-employe");
      document.getElementById("form-employe").reset();
      chargerEmployes();
    } catch (error) {
      afficherAlert("Erreur lors de l'ajout de l'employé.", "error");
    }
  });

async function chargerEmployes() {
  const tbody = document.getElementById("employes-tbody");
  tbody.innerHTML = "";

  // Récupérer les productions du jour
  const today = new Date().toISOString().slice(0, 10);
  const productionsDuJour = productions.filter((p) => p.date === today);

  employes.forEach((employe) => {
    const productionJournaliere = productionsDuJour
      .filter((p) => p.employeId === employe.id)
      .reduce((total, p) => total + p.ampoules_valides, 0);

    const performance =
      employe.quota > 0
        ? ((productionJournaliere / employe.quota) * 100).toFixed(0)
        : 0;
    const statutClass =
      employe.statut === "actif" ? "status-active" : "status-pending";

    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${employe.id}</td>
            <td>${employe.nom} ${employe.prenom}</td>
            <td>${employe.cellule}</td>
            <td>${employe.quota}</td>
            <td>${productionJournaliere}</td>
            <td>${performance}%</td>
            <td><span class="status-badge ${statutClass}">${employe.statut}</span></td>
            <td>
                <button class="btn-danger" onclick="supprimerEmploye(${employe.id})"><i class="fas fa-trash"></i></button>
            </td>
        `;
  });
}

async function supprimerEmploye(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
    employes = employes.filter((emp) => emp.id !== id);
    try {
      await saveEmployes();
      afficherAlert("Employé supprimé avec succès!", "success");
      chargerEmployes();
    } catch (error) {
      afficherAlert("Erreur lors de la suppression de l'employé.", "error");
    }
  }
}

// Gestion de la production
async function chargerEmployesProduction() {
  const select = document.getElementById("employe-production");
  select.innerHTML = '<option value="">Sélectionner un employé</option>';
  employes.forEach((employe) => {
    const option = document.createElement("option");
    option.value = employe.id;
    option.textContent = `${employe.nom} ${employe.prenom}`;
    select.appendChild(option);
  });
  updatePlaquesInfo();
}

document
  .getElementById("form-production")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const employeId = parseInt(
      document.getElementById("employe-production").value
    );
    const date = document.getElementById("date-production").value;
    const valides = parseInt(
      document.getElementById("ampoules-produites").value
    );
    const defectueuses = parseInt(
      document.getElementById("ampoules-defectueuses").value
    );

    const nouvelleProduction = {
      id:
        productions.length > 0
          ? Math.max(...productions.map((p) => p.id)) + 1
          : 1,
      employeId,
      date,
      ampoules_valides: valides,
      defectueuses,
    };
    productions.push(nouvelleProduction);

    try {
      await saveProductions();
      afficherAlert("Production enregistrée avec succès!", "success");
      document.getElementById("form-production").reset();
      document.getElementById("date-production").value = new Date()
        .toISOString()
        .slice(0, 10);
      updatePlaquesInfo();
      chargerEmployes(); // Mettre à jour le tableau des employés
    } catch (error) {
      afficherAlert(
        "Erreur lors de l'enregistrement de la production.",
        "error"
      );
    }
  });

function updatePlaquesInfo() {
  const today = new Date().toISOString().slice(0, 10);
  const productionAujourdhui = productions.filter((p) => p.date === today);
  const totalProductionJour = productionAujourdhui.reduce(
    (sum, p) => sum + p.ampoules_valides,
    0
  );
  const plaquesCompletes = Math.floor(totalProductionJour / ampoulesParPlaque);
  const ampoulesEnCours = totalProductionJour % ampoulesParPlaque;

  document.getElementById("production-jour").textContent = totalProductionJour;
  document.getElementById("plaques-completes").textContent = plaquesCompletes;
  document.getElementById("plaques-en-cours").textContent = plaquesCompletes;
  document.getElementById("plaques-completees-jour").textContent =
    plaquesCompletes;

  const progressPercentage = (ampoulesEnCours / ampoulesParPlaque) * 100;
  const progressBar = document.querySelector("#plaques-info .progress-bar");
  progressBar.style.width = `${progressPercentage}%`;
  document.getElementById(
    "prochaine-plaque-details"
  ).textContent = `${ampoulesEnCours} / ${ampoulesParPlaque} ampoules`;
}

// Gestion des paiements
async function calculerSalaires() {
  // Réinitialiser les paiements pour le mois en cours
  paiements = [];
  const today = new Date();
  const annee = today.getFullYear();
  const mois = today.getMonth();

  const productionsMois = productions.filter((p) => {
    const dateProduction = new Date(p.date);
    return (
      dateProduction.getFullYear() === annee &&
      dateProduction.getMonth() === mois
    );
  });

  const paiementsMois = {};
  employes.forEach((employe) => {
    const prodEmploye = productionsMois.filter(
      (p) => p.employeId === employe.id
    );
    const productionTotale = prodEmploye.reduce(
      (sum, p) => sum + p.ampoules_valides,
      0
    );
    const quotaMois = employe.quota * 25; // Supposons 25 jours ouvrables
    const pourcentageQuota = ((productionTotale / quotaMois) * 100).toFixed(0);
    const montantCalcule = productionTotale * employe.taux;

    const nouveauPaiement = {
      id:
        paiements.length > 0 ? Math.max(...paiements.map((p) => p.id)) + 1 : 1,
      employeId: employe.id,
      annee,
      mois,
      productionTotale,
      pourcentageQuota,
      montantCalcule,
      avancesVersees: 0,
      soldeDu: montantCalcule,
      statut: "en attente",
    };
    paiements.push(nouveauPaiement);
  });

  try {
    await savePaiements();
    afficherAlert("Salaires calculés avec succès!", "success");
    chargerPaiements();
  } catch (error) {
    afficherAlert("Erreur lors du calcul des salaires.", "error");
  }
}

async function chargerPaiements() {
  const tbody = document.getElementById("paiements-tbody");
  tbody.innerHTML = "";
  paiements.forEach((paiement) => {
    const employe = employes.find((emp) => emp.id === paiement.employeId);
    if (!employe) return;
    const statutClass =
      paiement.statut === "paye" ? "status-completed" : "status-pending";
    const statutText = paiement.statut === "paye" ? "Payé" : "En Attente";

    const row = tbody.insertRow();
    row.innerHTML = `
            <td>${employe.nom} ${employe.prenom}</td>
            <td>${paiement.mois + 1}/${paiement.annee}</td>
            <td>${paiement.productionTotale}</td>
            <td>${paiement.pourcentageQuota}%</td>
            <td>${paiement.montantCalcule.toLocaleString("fr-FR")} F</td>
            <td>${paiement.avancesVersees.toLocaleString("fr-FR")} F</td>
            <td>${paiement.soldeDu.toLocaleString("fr-FR")} F</td>
            <td><span class="status-badge ${statutClass}">${statutText}</span></td>
            <td>
                <button class="btn-success" onclick="gererPaiement(${
                  paiement.id
                })"><i class="fas fa-hand-holding-usd"></i> Payer</button>
                <button class="btn-info" onclick="afficherInfosPaiement(${
                  paiement.id
                })"><i class="fas fa-info-circle"></i> Infos</button>
            </td>
        `;
  });
}

function gererPaiement(id) {
  const paiement = paiements.find((p) => p.id === id);
  if (paiement) {
    document.getElementById("paiement-id-input").value = id;
    const employe = employes.find((emp) => emp.id === paiement.employeId);
    document.getElementById(
      "employe-paiement-nom"
    ).value = `${employe.nom} ${employe.prenom}`;
    document.getElementById("montant-du-input").value = paiement.soldeDu;
    document.getElementById("avance-input").value = paiement.avancesVersees;
    document.getElementById("solde-input").value = paiement.soldeDu;
    openModal("modal-paiement");
  }
}

document
  .getElementById("form-paiement")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById("paiement-id-input").value);
    const avance = parseFloat(document.getElementById("avance-input").value);
    const solde = parseFloat(document.getElementById("solde-input").value);

    const paiement = paiements.find((p) => p.id === id);
    if (paiement) {
      paiement.avancesVersees = avance;
      paiement.soldeDu = solde;
      if (solde <= 0) {
        paiement.statut = "paye";
      }
    }

    try {
      await savePaiements();
      afficherAlert("Paiement enregistré avec succès!", "success");
      closeModal("modal-paiement");
      chargerPaiements();
    } catch (error) {
      afficherAlert("Erreur lors de l'enregistrement du paiement.", "error");
    }
  });

function afficherInfosPaiement(paiementId) {
  const paiement = paiements.find((p) => p.id === paiementId);
  if (!paiement) {
    afficherAlert("Paiement non trouvé.", "error");
    return;
  }
  const employe = employes.find((emp) => emp.id === paiement.employeId);

  document.getElementById(
    "info-employe-nom"
  ).textContent = `${employe.nom} ${employe.prenom}`;
  document.getElementById(
    "info-production-totale"
  ).textContent = `${paiement.productionTotale} ampoules`;
  document.getElementById(
    "info-taux"
  ).textContent = `${employe.taux.toLocaleString("fr-FR")} F/ampoule`;
  document.getElementById(
    "info-quota"
  ).textContent = `${paiement.pourcentageQuota}%`;
  document.getElementById(
    "info-montant-initial"
  ).textContent = `${paiement.montantCalcule.toLocaleString("fr-FR")} F`;
  document.getElementById(
    "info-avances"
  ).textContent = `${paiement.avancesVersees.toLocaleString("fr-FR")} F`;
  document.getElementById(
    "info-solde"
  ).textContent = `${paiement.soldeDu.toLocaleString("fr-FR")} F`;
  document.getElementById("info-statut").textContent =
    paiement.statut === "paye" ? "Payé" : "En Attente";

  openModal("modal-infos-paiement");
}

// Génération de rapports
function genererRapport() {
  const dateDebut = document.getElementById("date-debut-rapport").value;
  const dateFin = document.getElementById("date-fin-rapport").value;
  const rapportContent = document.getElementById("rapport-content");

  if (!dateDebut || !dateFin) {
    rapportContent.innerHTML =
      '<p style="color: red;">Veuillez sélectionner une période complète.</p>';
    return;
  }

  const productionsPeriode = productions.filter(
    (p) => p.date >= dateDebut && p.date <= dateFin
  );
  const rapportParEmploye = {};

  productionsPeriode.forEach((p) => {
    const employe = employes.find((e) => e.id === p.employeId);
    if (employe) {
      if (!rapportParEmploye[p.employeId]) {
        rapportParEmploye[p.employeId] = {
          nom: `${employe.nom} ${employe.prenom}`,
          cellule: employe.cellule,
          productionTotale: 0,
          ampoulesDefectueuses: 0,
        };
      }
      rapportParEmploye[p.employeId].productionTotale += p.ampoules_valides;
      rapportParEmploye[p.employeId].ampoulesDefectueuses += p.defectueuses;
    }
  });

  const rapportData = Object.values(rapportParEmploye);
  const jsonRapport = JSON.stringify(rapportData, null, 2);

  const blob = new Blob([jsonRapport], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `rapport_production_${dateDebut}_${dateFin}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  afficherAlert("Rapport généré et téléchargé en JSON !", "success");
}

// Initialisation
async function init() {
  try {
    const [employesData, productionsData, paiementsData] = await Promise.all([
      fetch(`${API_URL}/employes`).then((res) => res.json()),
      fetch(`${API_URL}/productions`).then((res) => res.json()),
      fetch(`${API_URL}/paiements`).then((res) => res.json()),
    ]);
    employes = employesData;
    productions = productionsData;
    paiements = paiementsData;

    showTab("dashboard");
    updatePlaquesInfo();
  } catch (error) {
    console.error("Erreur de chargement des données initiales:", error);
    afficherAlert(
      "Impossible de charger les données initiales. Le serveur est peut-être arrêté.",
      "error"
    );
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("date-production").value = new Date()
    .toISOString()
    .slice(0, 10);
  init();
});
