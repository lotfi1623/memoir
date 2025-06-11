import db from '../db.js';

export const accepteVacateur = async (idEnseignant) => {
      await db.query(`UPDATE enseignant SET etat = 1 WHERE users_id ='${idEnseignant}'`);
}

export const ShowVacateur = async (idDepartement) => {
    const [rows] = await db.query(`SELECT nomEnseignant , PrenomEnseignant , Email FROM enseignant WHERE Etat = 0 
      AND idDepartement = '${idDepartement}' ORDER BY nomEnseignant ASC`);
    return rows;
}

export const refuseVacateur = async (idEnseignant) => {
    await db.query(`DELETE FROM enseignant WHERE users_id ='${idEnseignant}'`);
}

export const showEnseignant = async (idDepartement) => {
    const [rows] = await db.query(`SELECT e.users_id , e.nomEnseignant , e.PrenomEnseignant,d.Nom_departement ,e.Rang FROM enseignant e 
      JOIN departement d ON e.idDepartement = d.idDepartement
      WHERE e.etat = 1 AND  e.idDepartement = '${idDepartement}' ORDER BY e.nomEnseignant ASC`);  
    return rows;
}

export const countVacateur = async (idDepartement) => {
    const [rows] = await db.query(`SELECT COUNT(*) as count FROM enseignant WHERE etat = 0  AND idDepartement = '${idDepartement}'`);
    return rows;
}

export const countEnseignant = async (idDepartement) => {
    const [rows] = await db.query(`SELECT COUNT(*) as count FROM enseignant WHERE etat = 1  AND idDepartement = '${idDepartement}'`);
    return rows;
}

export const countVacateurAccepter = async (idDepartement) => {
    const [rows] = await db.query(`SELECT COUNT(*) as count FROM enseignant WHERE etat = 1  AND idDepartement = '${idDepartement}'`);
    return rows;
}

export const showVacateurAccepter = async (idDepartement) => {
    const [rows] = await db.query(`SELECT * FROM enseignant WHERE etat = 1  AND idDepartement = '${idDepartement}' ORDER BY nomEnseignant ASC`);
    return rows;
}

export const FindId = async (idChef) => {
  const [rows] = await db.query(`SELECT e.nomEnseignant,e.DateDeNaissance , e.PrenomEnseignant,c.Email,u.NomUnniversite,f.nomFaculté,d.Nom_departement
                                 FROM chef c
                                 JOIN enseignant e ON c.users_id = e.users_id
                                 JOIN faculté f ON e.idFaculté = f.idFaculté
                                  JOIN unniversite u ON e.idUnniverite = u.idUnniversité
                                 JOIN departement d ON e.idDepartement = d.idDepartement
                                 WHERE c.users_id = '${idChef}'`);
  return rows;
}

export const chefLogin = async(email) =>{
    const [rows] = await db.query(`SELECT *FROM chef WHERE Email = '${email}'`)
    return rows;
}




export const finVacateur = async (idEnseignant) => {
    const [rows] = await db.query(`SELECT * FROM enseignant WHERE users_id = '${idEnseignant}'`);
    return rows[0];
}

export const showVacateurByIdDep = async(idChef) => {
    const [row] = await db.query(`SELECT e.idDepartement from chef c
        JOIN enseignant e ON e.users_id = c.users_id
        WHERE c.users_id = '${idChef}'`);
    return row[0].idDepartement;
    
    
}


  
    

export const sommeValeur = async(idDepartement) => {
    const [row] = await db.query(`SELECT 
                                  e.nomEnseignant,
                                  e.prenomEnseignant,
                                SEC_TO_TIME(SUM(FLOOR(valeurHeures) * 60 + 
                                (valeurHeures - FLOOR(valeurHeures)) * 100)) AS total_heures
                                FROM relever r
                                JOIN enseignant e ON r.users_id = e.users_id
                                WHERE e.idDepartement = '${idDepartement}'
                                GROUP BY e.users_id`)
    return row
}
 export const sommeValeurParMois = async(idDepartement) => {
    const [row] = await db.query(`SELECT
      u.NomUnniversite,
      f.nomFaculté,
      d.Nom_departement,
  e.nomEnseignant,
  e.PrenomEnseignant,
  MONTHNAME(r.Date) AS mois,
  YEAR(r.Date) AS annee,
  SEC_TO_TIME(SUM(
    FLOOR(r.valeurHeures) * 60 + 
    (r.valeurHeures - FLOOR(r.valeurHeures)) * 100
  )) AS total_heures
FROM relever r
JOIN enseignant e ON r.users_id = e.users_id
JOIN departement d ON e.idDepartement = d.idDepartement
JOIN faculté f ON e.idFaculté = f.idFaculté
JOIN unniversite u ON e.idUnniverite = u.idUnniversité
WHERE e.idDepartement = '${idDepartement}'
GROUP BY e.nomEnseignant, e.prenomEnseignant, YEAR(r.Date), MONTH(r.Date)
ORDER BY annee, MONTH(r.Date)`)
    return row
 }


 export const sommeValeurParMoisById = async(idEnseignant , mois) => {
  const [row] = await db.query(`SELECT 
e.nomEnseignant,
e.PrenomEnseignant,
MONTHNAME(r.Date) AS mois,
YEAR(r.Date) AS annee,
SEC_TO_TIME(SUM(
  FLOOR(r.valeurHeures) * 60 + 
  (r.valeurHeures - FLOOR(r.valeurHeures)) * 100
)) AS total_heures
FROM relever r
JOIN enseignant e ON r.users_id = e.users_id
WHERE r.users_id = '${idEnseignant}' AND MONTH(r.Date) = '${mois}'
GROUP BY e.nomEnseignant, e.prenomEnseignant, YEAR(r.Date), MONTH(r.Date)
ORDER BY annee, MONTH(r.Date)`)
  return row
}


export const heureTotal = async(idEns , mois) => {
  const [row] = await db.query(`
    SELECT 
      SEC_TO_TIME(SUM(
        FLOOR(r.valeurHeures) * 60 + 
        (r.valeurHeures - FLOOR(r.valeurHeures)) * 100
      )) AS total_heures
    FROM relever r
    WHERE r.users_id = '${idEns}' 
      AND MONTH(r.Date) = '${mois}'
    `)
  return row[0].total_heures
}




 export const sommeValeurById = async(idEnseignant) => {
  const [row] = await db.query(`SELECT 
                              SEC_TO_TIME(SUM(FLOOR(valeurHeures) * 60 + 
                              (valeurHeures - FLOOR(valeurHeures)) * 100)) AS total_heures
                              FROM relever
                              WHERE users_id = '${idEnseignant}'
                              GROUP BY users_id
                              `)
  return row
}


export const modifierChef = async (idChef ,emailChef) => {
  await db.query(`UPDATE chef SET   Email = '${emailChef}' WHERE users_id = '${idChef}'`)
} 
export const modifierEnseignant = async (idEnseignant , nomEnseignant , prenomEnseignant , dateDeNaissance) => {
  await db.query(`UPDATE enseignant SET nomEnseignant = '${nomEnseignant}' , PrenomEnseignant = '${prenomEnseignant}' , DateDeNaissance = '${dateDeNaissance}' WHERE users_id = '${idEnseignant}'`)
}

export const findChefEnseignant = async (idChef) => {
  const [rows] = await db.query(`SELECT e.users_id FROM chef c 
    JOIN enseignant e ON e.users_id = c.users_id
    WHERE c.users_id = '${idChef}'`);
  return rows[0].users_id;
}



