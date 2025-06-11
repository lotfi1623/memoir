import db from '../db.js';


export const modifierEns = async (idEnseignant,email, DateDeNaissance) => {
    await db.query(`UPDATE enseignant SET  Email = '${email}', DateDeNaissance = '${DateDeNaissance}'  WHERE users_id = '${idEnseignant}'`);
}

export const showEnsei = async (idEnseignant) => {
    const [row] = await db.query(`SELECT f.nomFaculté , d.Nom_departement , e.Email , e.nomEnseignant , e.PrenomEnseignant , e.DateDeNaissance FROM enseignant e
        JOIN departement d ON e.idDepartement = d.idDepartement
        JOIN faculté f ON f.idFaculté = e.idFaculté
        WHERE e.users_id = '${idEnseignant}'`);
    return row;
}

export const showEnseign = async (idEnseignant) => {
    const [row] = await db.query(`SELECT f.nomFaculté , d.Nom_departement , e.Email , e.nomEnseignant , e.PrenomEnseignant , e.DateDeNaissance FROM enseignant e
        JOIN departement d ON e.idDepartement = d.idDepartement
        JOIN faculté f ON f.idFaculté = e.idFaculté
        WHERE e.users_id = '${idEnseignant}' AND etat = 0`);
    return row;
}

export const modifier = async (idEnseignant, email,password) => {
    await db.query(`UPDATE users SET Email = '${email}',Password ='${password}' WHERE users_id = '${idEnseignant}'`);
}

export const saisir = async(id , date , Début , Fin , idNiveau , idSpecialite , type , idModule , sujet ,valeur , etat) => {
    await db.query(`INSERT INTO relever (users_id , Date , Début , Fin , idNiveau , idSpécialité , Type , idModule , Sujet , valeurHeures, Etat ) VALUES ('${id}','${date}' , '${Début}' , '${Fin}' , '${idNiveau}', '${idSpecialite}', '${type}' , '${idModule}' , '${sujet}','${valeur}'  , '${etat}')`)
}

export const findEnseignant = async(id) => {
    const [row] = await db.query(`SELECT * FROM enseignant WHERE users_id = '${id}'`);
    return row[0];
}

export const divisionTime = async(debut, fin) =>{

        const [h1, m1] = debut.split(":").map(Number);
        const [h2, m2] = fin.split(":").map(Number);
        const total1 = h1 * 60 + m1;
        const total2 = h2 * 60 + m2;
        const diff = total2 - total1;
      
        const heures = Math.floor(diff / 60);
        const minutes = diff % 60;
      
        return `${heures}:${minutes === 0 ? "00" : minutes}`;
      
      
}


export const maxHeure = async() => {
    const [row] = await db.query(`SELECT *FROM maxHeure`)
    return row[0]
}
