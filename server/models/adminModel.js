import e from 'express';
import db from '../db.js';





export const findEnsei = async(idEnseignant) => {
    const [row] = await db.query(`SELECT * FROM enseignant WHERE users_id = '${idEnseignant}'`);
    return row[0];
}

export const addChef = async(idChef , Email , password) =>{
    await db.query(`INSERT INTO chef (users_id , Email , password ) VALUES ('${idChef}' , '${Email}' , '${password}')`);
}


export const ListeUnniv = async() => {
    const [row] = await db.query(`SELECT * FROM unniversite`);
    return row;
}

export const ListeFac = async() => {
    const [row] = await db.query(`SELECT f.nomFaculté,f.idFaculté,u.NomUnniversite FROM unniversite u
        JOIN faculté f ON u.idUnniversité = f.idUnniversité`);
    return row;
}

export const ListeDep = async() => {
    const [row] = await db.query(`SELECT d.idDepartement , d.Nom_departement , u.NomUnniversite , f.nomFaculté  FROM departement d
        JOIN faculté f ON d.idFaculé = f.idFaculté
        JOIN unniversite u ON u.idUnniversité = d.idUnniverite`);
    return row;
}

export const ListeFil = async() => {
    const [row] = await db.query(`SELECT fi.idFilière , fi.NomFilière , u.NomUnniversite , f.nomFaculté FROM filière fi 
        JOIN unniversite u ON u.idUnniversité = fi.idUnniverite
        JOIN faculté f ON f.idFaculté = fi.idFaculté`);
    return row;
}

export const ListeNiv = async() => {
    const [row] = await db.query(`SELECT * FROM niveau`)
    return row;
}

export const ListeSpec = async() => {
    const [row] = await db.query(`SELECT s.idSpécialité , s.NomSpécialité , d.Nom_departement ,  f.nomFaculté ,u.NomUnniversite  FROM spécialité s
        JOIN departement d ON d.idDepartement = s.idDepartement
        JOIN faculté f ON f.idFaculté = s.idFaculté
        JOIN unniversite u ON u.idUnniversité = s.idUnniverite`);
    return row;
}

export const ListeMod = async() => {
    const [row] = await db.query(`SELECT m.idModule,m.Nom_module , d.Nom_departement,s.NomSpécialité , n.NomNiveau  FROM module m
        JOIN departement d ON d.idDepartement = m.idDepartement
        JOIN spécialité s ON s.idSpécialité = m.idSpécialité
        JOIN niveau n ON n.idNiveau = m.idNiveau`);
    return row;
}



export const addUnniversite = async(NomUnniv) => {
    await db.query(`INSERT INTO unniversite (NomUnniversite) VALUES ('${NomUnniv}')`);
}

export const showAllUnniv = async () => {
    const [row] = await db.query(`SELECT NomUnniversite , idUnniversité from unniversite`)
    return row;
}

export const showFaculteByUnniv = async (idUnniv) => {
    const [rows] = await db.query(`SELECT nomFaculté FROM faculté WHERE idUnniversité = '${idUnniv}'`)
    return rows;
}

export const showSpecialiteByFiliere = async (idFiliere) => {
    const [row] = await db.query(`SELECT NomSpécialité FROM spécialité WHERE idFilière = '${idFiliere}'`)
    return row;
}
export const showNiveauBySpecialite = async (idSpecialite) => {
    const [row] = await db.query(`SELECT nomNiveau FROM niveau WHERE idSpécialité = '${idSpecialite}'`)
    return row;
}
export const showModuleByNiveau = async (idNiveau) => {
    const [row] = await db.query(`SELECT Nom_module FROM module WHERE idNiveau = '${idNiveau}'`)
    return row;
}

export const showFiliereByDepartement = async (idDepartement) => {
    const [rows] = await db.query(`SELECT nomFilière FROM filière WHERE idDepartement = '${idDepartement}'`)
    return rows;
}

export const showDepartementByFaculte = async (idFaculte) => {
    const [rows] = await db.query(`SELECT Nom_departement FROM departement WHERE idFaculé = '${idFaculte}'`)
    return rows;
}

export const addFaculte = async(idUnniversite , NomFaculte) => {
    await db.query(`INSERT INTO faculté(idUnniversité , nomFaculté) VALUES ('${idUnniversite}' , '${NomFaculte}')`)
}

export const addDepartement = async(idUnniversite,idFaculte , NomDepartement) => {
    await db.query(`INSERT INTO departement(idUnniversité , idFaculté , NomDepartement) VALUES ('${idUnniversite}' , '${idFaculte}' , '${NomDepartement}')`)
}   

export const addfilière = async(idUnniversite,idFaculte,idDepartement , NomFilière) => {
    await db.query(`INSERT INTO filière(idUnniverite , idFaculté ,idDepartement , nomFilière) VALUES ('${idUnniversite}','${idFaculte}','${idDepartement}','${NomFilière}')`)
}

export const addNiveau = async(idUnniversite,idFaculte,idDepartement,idFilière , NomNiveau) => {
    await db.query(`INSERT INTO niveau(idUnniversité , idFaculté ,idDepartement , idFilière , nomNiveau) VALUES ('${idUnniversite}','${idFaculte}','${idDepartement}','${idFilière}','${NomNiveau}')`)
}
export const addSpecialite = async(idUnniversite,idFaculte,idDepartement,idFilière , NomSpecialite) => {
    await db.query(`INSERT INTO spécialité(idUnniverite , idFaculté ,idDepartement , idFilière  , nomSpécialité) VALUES ('${idUnniversite}','${idFaculte}','${idDepartement}','${idFilière}','${NomSpecialite}')`)
}

export const addModule = async(idUnniversite,idFaculte,idDepartement,idFilière,idNiveau,idSpecialite , NomModule) => {
    await db.query(`INSERT INTO module(idUnniverite , idFaculté ,idDepartement , idFilière , idNiveau , idSpécialité , Nom_module) VALUES ('${idUnniversite}','${idFaculte}','${idDepartement}','${idFilière}','${idNiveau}','${idSpecialite}','${NomModule}')`)
}

export const chefExiste = async (idDepartement) =>{
    const [rows] = await db.query(`SELECT COUNT(*) AS count FROM chef c 
                                   JOIN enseignant e ON c.users_id = e.users_id 
                                   WHERE e.idDepartement = '${idDepartement}'`);
    return rows;
}
export const removeChef = async (idChef) =>{
    await db.query(`DELETE FROM chef WHERE users_id ='${idChef}'`)
} 

export const findChef = async (idChef) => {
    const [rows] = await db.query(`SELECT *FROM chef WHERE users_id = '${idChef}'`)
    return rows[0];
}

export const showArchif = async () => {
    const [rows] = await db.query(`SELECT d.Nom_departement , a.nomChef , a.prenomChef , a.Email FROM archif a
        JOIN departement d ON a.idDepartement = d.idDepartement`)
    return rows[0];
}




export const chooseEnsByUnniFacDep = async (idUnniversité , idFaculté , idDepartement) => {
    const [rows] = await db.query(`SELECT users_id,nomEnseignant,PrenomEnseignant,Email FROM enseignant 
        WHERE users_id NOT IN (SELECT users_id FROM chef)
        AND idUnniverite = '${idUnniversité}' 
        AND idFaculté = '${idFaculté}' 
        AND idDepartement = '${idDepartement}'`)
    return rows;
}




export const find = async () => {
    const [rows] = await db.query(`SELECT  e.nomEnseignant , e.PrenomEnseignant,c.Email,f.nomFaculté,d.Nom_departement
                                   FROM chef c
                                   JOIN enseignant e ON c.users_id = e.users_id
                                   JOIN faculté f ON e.idFaculté = f.idFaculté
                                   JOIN departement d ON e.idDepartement = d.idDepartement;`)
    return rows;
}

export const findEnseignantDep = async (idEnseignant) => {
    const [rows] = await db.query(`SELECT *FROM enseignant WHERE users_id = '${idEnseignant}'`)
    return rows[0];
}

export const findChefByDep = async (idDepartement) => {
    const [rows] = await db.query(`SELECT c.users_id ,e.nomEnseignant,e.PrenomEnseignant, c.Email   FROM chef c
        JOIN enseignant e ON c.users_id = e.users_id 
        WHERE e.idDepartement = '${idDepartement}'`)
    return rows[0];
}


export const addToArchif = async (idChef , idDepartement , Email , nomChef , prenomChef) => {
    await db.query(`INSERT INTO archif (users_id , idDepartement , Email , nomChef , prenomChef) 
                    VALUES ('${idChef}' , '${idDepartement}' , '${Email}' , '${nomChef}' , '${prenomChef}')`)
}


export const FindDepByEns = async (idDepartement) => {
    const [row] = await db.query(`SELECT d.idDepartement FROM enseignant e
        JOIN departement d ON e.idDepartement = d.idDepartement  
        WHERE e.idDepartement = ${idDepartement}`)
    return row[0];
}
export const updateUnniv = async (idUnniv, NomUnniv) => {
    await db.query(`UPDATE unniversite SET NomUnniversite = '${NomUnniv}' WHERE idUnniversité = '${idUnniv}'`);
}

export const updateFaculte = async (idFaculte , idUnniverite, NomFaculte) => {
    await db.query(`UPDATE faculté SET idUnniversité = '${idUnniverite}' , nomFaculté = '${NomFaculte}' WHERE idFaculté = '${idFaculte}'`);
}

export const updateDepartement = async (idDepartement , idUnniverite , idFaculte , NomDepartement) => {
    await db.query(`UPDATE departement SET idUnniverite = '${idUnniverite}' , idFaculé = '${idFaculte}' , Nom_departement = '${NomDepartement}' WHERE idDepartement = '${idDepartement}'`);
}

export const updateFiliere = async (idFiliere , idUnniverite , idFaculte , idDepartement , NomFiliere) => {
    await db.query(`UPDATE filière SET idUnniverite = '${idUnniverite}' , idFaculté = '${idFaculte}' , idDepartement = '${idDepartement}' , nomFilière = '${NomFiliere}' WHERE idFilière = '${idFiliere}'`);
}

export const updateSpecialite = async (idSpecialite , idUnniverite , idFaculte , idDepartement , idFiliere , NomSpecialite) => {
    await db.query(`UPDATE spécialité SET idUnniverite = '${idUnniverite}' , idFaculté = '${idFaculte}' , idDepartement = '${idDepartement}' , idFilière = '${idFiliere}' , NomSpécialité = '${NomSpecialite}' WHERE idSpécialité = '${idSpecialite}'`);
}

export const updateNiveau = async (idNiveau , idUnniverite , idFaculte , idDepartement , idFiliere , NomNiveau) => {
    await db.query(`UPDATE niveau SET idUnniverite = '${idUnniverite}' , idFaculté = '${idFaculte}' , idDepartement = '${idDepartement}' , idFilière = '${idFiliere}' , NomNiveau = '${NomNiveau}' WHERE idNiveau = '${idNiveau}'`);
}

export const updateModule = async (idModule , idUnniverite , idFaculte , idDepartement , idFiliere , idNiveau , NomModule) => {
    await db.query(`UPDATE module SET idUnniverite = '${idUnniverite}' , idFaculté = '${idFaculte}' , idDepartement = '${idDepartement}' , idFilière = '${idFiliere}' , idNiveau = '${idNiveau}' , Nom_module = '${NomModule}' WHERE idModule = '${idModule}'`);
}


export const dropUnniv = async (idUnniv) => {
    await db.query(`DELETE FROM unniversite WHERE idUnniversité = '${idUnniv}'`);
}

export const dropFaculte = async (idFaculte) => {
    await db.query(`DELETE FROM faculté WHERE idFaculté = '${idFaculte}'`);
};

export const dropDepartement = async (idDepartement) => {
    await db.query(`DELETE FROM departement WHERE idDepartement = '${idDepartement}'`);
}

export const dropFiliere = async (idFiliere) => {
    await db.query(`DELETE FROM filière WHERE idFilière = '${idFiliere}'`);
};

export const dropSpecialite = async (idSpecialite) => {
    await db.query(`DELETE FROM spécialité WHERE idSpécialité = '${idSpecialite}'`);
}

export const dropNiveau = async (idNiveau) => {
    await db.query(`DELETE FROM niveau WHERE idNiveau = '${idNiveau}'`);
};

export const dropModule = async (idModule) => {
    await db.query(`DELETE FROM module WHERE idModule = '${idModule}'`);
}

export const nbrUnniv = async () => {
    const [row] = await db.query(`SELECT COUNT(*) AS count FROM unniversite`);
    return row[0].count;
}
export const nbrFaculte = async () => {
    const [row] = await db.query(`SELECT COUNT(*) AS count FROM faculté`);
    return row[0].count;
}
export const nbrDepartement = async () => {
    const [row] = await db.query(`SELECT COUNT(*) AS count FROM departement`);
    return row[0].count;
}
export const nbrChef = async () => {
    const [row] = await db.query(`SELECT COUNT(*) AS count FROM chef`);
    return row[0].count;
}
