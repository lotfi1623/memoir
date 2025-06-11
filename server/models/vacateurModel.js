import db from '../db.js';

export const inscription = async ( idUser , idUnnniversite , idFaculte , idDepartement , idFiliere , idSpecialite , idNiveau , idModule , nomVac , prenomVac ,dateDeNecaence , email, rang , etat) =>{
    await db.query(`INSERT INTO enseignant (users_id , idUnniverite , idFaculté , idDepartement , idFilière , idSpécialité , idNiveau , idModule , nomEnseignant , PrenomEnseignant,	DateDeNaissance , Email , Rang,Etat)
         VALUES ('${idUser }' , '${idUnnniversite}' , '${idFaculte}' , '${idDepartement}' , '${idFiliere}' , '${idSpecialite}' , '${idNiveau}' , '${idModule}' , '${nomVac}' , '${prenomVac}' ,'${dateDeNecaence}','${email}','${rang}','${etat}' ) `)
}

export const FindModule = async (nomModule) =>{
    const [row] = await db.query(`SELECT *FROM module WHERE Nom_module='${nomModule}'`);
    return row[0];
}

export const findNiveau = async (nomNiveau) =>{
    const [row] = await db.query(`SELECT *FROM niveau WHERE NomNiveau='${nomNiveau}'`);
    return row[0];
}
export const findSpecialite = async (nomSpecialite) =>{
    const [row] = await db.query(`SELECT *FROM spécialité WHERE NomSpécialité='${nomSpecialite}'`);
    return row[0];
}
export const findFiliere = async (nomFiliere) =>{
    const [row] = await db.query(`SELECT *FROM filière WHERE NomFilière='${nomFiliere}'`);
    return row[0];
}
export const findDepartement = async (nomDepartement) =>{
   const [row] = await db.query(`SELECT *FROM departement WHERE Nom_departement='${nomDepartement}'`);
   return row[0];
}
export const findFaculte = async (nomFaculte) =>{
    const [row] = await db.query(`SELECT *FROM faculté WHERE NomFaculté='${nomFaculte}'`);
    return row[0];
}
export const findUnniversite = async (nom) =>{  
     const [rows] = await db.query(`SELECT *FROM unniversite WHERE NomUnniversite ='${nom}'`);
    return rows[0];
}
export const findVacateur = async(userId) => {
    const [row] = await db.query("SELECT * FROM decition WHERE users_id = ?", [userId]);
    return row[0];
}

export const supprimerVacateur = async (idUser) =>{
    await db.query(`DELETE FROM enseignant WHERE users_id='${idUser}' AND Etat=0`);
}
export const voir = async (idUser) =>{
    const [row] = await db.query(`SELECT u.NomUnniversite , f.nomFaculté , d.Nom_departement , fi.NomFilière , s.NomSpécialité , n.NomNiveau , m.Nom_module , e.nomEnseignant , e.PrenomEnseignant , e.DateDeNaissance , e.Email , e.Rang FROM enseignant e
        JOIN unniversite u ON e.idUnniverite = u.idUnniversité
        JOIN faculté f ON e.idFaculté = f.idFaculté
        JOIN departement d ON e.idDepartement = d.idDepartement
        JOIN filière fi ON e.idFilière = fi.idFilière
        JOIN spécialité s ON e.idSpécialité = s.idSpécialité
        JOIN niveau n ON e.idNiveau = n.idNiveau
        JOIN module m ON e.idModule = m.idModule
        WHERE e.users_id='${idUser}' AND e.Etat=0`);
        
    return row;
}


export const vacateurAcc = async(idUser) =>{
    const [row] = await db.query(`SELECT Etat FROM enseignant WHERE users_id='${idUser}'`);
    return row;

}

export const vacateurNoAcc = async(idUser) =>{
    const [row] = await db.query(`SELECT * FROM enseignant WHERE users_id='${idUser}' AND Etat=0`);
    return row;
}