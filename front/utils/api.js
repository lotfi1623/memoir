const API_URL = "https://memoir-server-prau.onrender.com"; // Remplace par l'URL de ton backend

export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`);
    if (!response.ok) throw new Error("Erreur API");
    return await response.text(); // text() au lieu de json() car ton API renvoie du texte simple
  } catch (error) {
    console.error("Erreur API:", error);
    return null;
  }
};
