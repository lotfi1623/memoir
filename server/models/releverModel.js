import db from '../db.js'

export const findEnseignantModule = async (idEnseignant) => {
  const [rows] = await db.query(`
    SELECT DISTINCT m.Nom_module 
    FROM enseignant e
    JOIN module m ON e.idModule = m.idModule
    WHERE e.users_id = '${idEnseignant}' AND Etat = 1;
  `);
  return rows.map(row => row.Nom_module);
}





export const afficheReleverById = async(idEnseignant) => {
    const [row] = await db.query(`
        SELECT 
        r.idRelever,
          m.Nom_module,
          r.Date,
          r.Début,
          r.Fin,
          n.NomNiveau,
          s.NomSpécialité,
          r.Type,
          r.Sujet
        FROM relever r
        JOIN module m ON r.idModule = m.idModule
        JOIN spécialité s ON r.idSpécialité = s.idSpécialité
        JOIN niveau n ON r.idNiveau = n.idNiveau
        WHERE r.users_id = '${idEnseignant}' AND r.etat = 0
      `);
      return row;
}

export const verifierHeureById = async(idEnseignant) => {
    const [row] = await db.query(`
        SELECT 
          m.Nom_module,
          r.Date,
          r.Début,
          r.Fin,
          n.NomNiveau,
          s.NomSpécialité,
          r.Type,
          r.Sujet
        FROM relever r
        JOIN module m ON r.idModule = m.idModule
        JOIN spécialité s ON r.idSpécialité = s.idSpécialité
        JOIN niveau n ON r.idNiveau = n.idNiveau
        WHERE r.users_id = '${idEnseignant}' AND r.etat = 1
      `);
      return row;
}

export const FindEnseignantSpecialite = async(idEnseignant) => {
    const [row]  = await db.query(`SELECT DISTINCT s.NomSpécialité as nom from enseignant e
      JOIN module m ON e.idModule = m.idModule
        JOIN spécialité s ON m.idSpécialité = s.idSpécialité
        WHERE e.users_id = '${idEnseignant}' AND Etat = 1`);
    return row;
}

export const FindEnseignantNiveau = async(idEnseignant) => {
    const [row] = await db.query(`SELECT DISTINCT n.NomNiveau from enseignant e
        JOIN module m ON e.idModule = m.idModule
        JOIN niveau n ON m.idNiveau = n.idNiveau
        WHERE e.users_id = '${idEnseignant}' AND Etat = 1`)
    return row;
}


export const afficheReleverByDepartement = async(idDepartement) => {
    const [row] = await db.query(`
        SELECT 
          m.Nom_module,
          r.Date,
          r.Début,
          r.Fin,
          n.NomNiveau,
          s.NomSpécialité,
          r.Type,
          r.Sujet
        FROM relever r
        JOIN module m ON r.idModule = m.idModule
        JOIN spécialité s ON r.idSpécialité = s.idSpécialité
        JOIN niveau n ON r.idNiveau = n.idNiveau
        JOIN enseignant e ON r.users_id = e.users_id
        WHERE e.idDepartement = '${idDepartement}'
      `);
      return row;
}

export const nHeureNoValid = async() => {
  const [row] = await db.query(`SELECT COUNT(*) as somme FROM relever WHERE etat = 0`); 
  return row[0].somme;
}

export const showIdDep = async (idChef) => {
  const [row] = await db.query(`SELECT d.idDepartement FROM chef c
    JOIN enseignant e ON c.users_id = e.users_id
    JOIN departement d ON e.idDepartement = d.idDepartement
    WHERE c.users_id = '${idChef}'`);
  return row[0].idDepartement;
}

export const showEnseignantByIdDep = async(idDepartement) => {
  const [row] = await db.query(`SELECT COUNT(*) FROM relever r
    JOIN enseignant e ON r.users_id = e.users_id
    WHERE e.idDepartement = '${idDepartement}'`);
  return row;
  }

export const heureValider = async(idRelever) => {
  db.query(`UPDATE relever SET etat = 1 WHERE idRelever = '${idRelever}'`)
}

export const updateHeure = async (idRelever, idModule, idNiveau, idSpecialite, Début, Fin, type, sujet) => {
  await db.query(`UPDATE relever SET idModule = '${idModule}', idNiveau = '${idNiveau}', idSpécialité = '${idSpecialite}', Début = '${Début}', Fin = '${Fin}', Type = '${type}', Sujet = '${sujet}' , Etat = 0 WHERE idRelever = '${idRelever}'`);
}

export const afficher = async (idEnseignant) => {
  const [row] = await db.query(`
    SELECT 
      r.idRelever,
      m.Nom_module,
      r.Date,
      r.Début,
      r.Fin,
      n.NomNiveau,
      s.NomSpécialité,
      r.Type,
      r.Sujet
    FROM relever r
    JOIN module m ON r.idModule = m.idModule
    JOIN spécialité s ON r.idSpécialité = s.idSpécialité
    JOIN niveau n ON r.idNiveau = n.idNiveau
    WHERE r.users_id = '${idEnseignant}' AND r.etat = 0
  `);
  return row;
}


export const releverError = async(id) => {
  await db.query(`UPDATE relever SET Etat = -1 WHERE idRelever = '${id}'`)
}

export const showError = async(idEnseignant) => {
  const [row] = await db.query(`
        SELECT 
        r.idRelever,
          m.Nom_module,
          r.Date,
          r.Début,
          r.Fin,
          n.NomNiveau,
          s.NomSpécialité,
          r.Type,
          r.Sujet
        FROM relever r
        JOIN module m ON r.idModule = m.idModule
        JOIN spécialité s ON r.idSpécialité = s.idSpécialité
        JOIN niveau n ON r.idNiveau = n.idNiveau
        WHERE r.users_id = '${idEnseignant}' AND r.etat = -1
      `);
      return row;
}

export const informtion = async() =>{
  const [row] = await db.query(`SELECT 
                                 e.nomEnseignant,
                                 e.PrenomEnseignant,
                                 r.Date,
                                 COUNT(*) AS nombre_seances
                                 FROM 
                                 relever r
                                 JOIN 
                                 enseignant e ON r.users_id = e.users_id
                                 
                                 GROUP BY 
                                 r.users_id, r.Date
                                 ORDER BY 
                                 r.Date, e.nomEnseignant;
`) 
return row
}


export const showErrorEnseignant = async(id) =>{
  const [row] = await db.query(`SELECT DISTINCT e.nomEnseignant , e.PrenomEnseignant , e.Email ,r.Date, r.Début , r.Fin , r.Type , m.Nom_module FROM relever r
                          JOIN enseignant e ON e.users_id = r.users_id
                          JOIN module m ON m.idModule = e.idModule
                          WHERE r.idRelever = '${id}'
                          `)
  return row
}


