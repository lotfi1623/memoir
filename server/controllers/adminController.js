import{addChef,findEnsei, showFaculteByUnniv} from '../models/adminModel.js';
import {addUnniversite} from '../models/adminModel.js';
import {addFaculte} from '../models/adminModel.js'
import {addDepartement} from '../models/adminModel.js';
import {addfilière} from '../models/adminModel.js'
import {addNiveau} from '../models/adminModel.js';
import {addSpecialite} from '../models/adminModel.js';
import {addModule} from '../models/adminModel.js';
import { findUnniversite } from '../models/vacateurModel.js';
import { findFaculte } from '../models/vacateurModel.js';
import { findDepartement } from '../models/vacateurModel.js'
import { findFiliere } from '../models/vacateurModel.js';
import { findSpecialite } from '../models/vacateurModel.js'
import { findNiveau } from '../models/vacateurModel.js';
import { chefExiste } from '../models/adminModel.js';
import { findChef } from '../models/adminModel.js'; 
import { removeChef } from '../models/adminModel.js';
import { showArchif } from '../models/adminModel.js';
import { chooseEnsByUnniFacDep } from '../models/adminModel.js';
import { find } from '../models/adminModel.js';
import { addToArchif } from '../models/adminModel.js';
import {sendEmailByGoogle} from '../ResendService.js';
import { showDepartementByFaculte } from '../models/adminModel.js';
import { showAllUnniv } from '../models/adminModel.js';
import {showFiliereByDepartement} from '../models/adminModel.js';
import {showSpecialiteByFiliere}    from '../models/adminModel.js';
import {showNiveauBySpecialite} from '../models/adminModel.js';
import {showModuleByNiveau} from '../models/adminModel.js';
import { ListeUnniv } from '../models/adminModel.js';
import { ListeFac } from '../models/adminModel.js';
import { ListeDep } from '../models/adminModel.js';
import { ListeFil } from '../models/adminModel.js';
import { ListeNiv } from '../models/adminModel.js';
import { ListeSpec , ListeMod} from '../models/adminModel.js';
import{ findChefByDep } from '../models/adminModel.js';
import { findEnseignantDep } from '../models/adminModel.js';
import { updateUnniv } from '../models/adminModel.js';
import { updateFaculte } from '../models/adminModel.js';
import { updateDepartement } from '../models/adminModel.js';
import { updateFiliere } from '../models/adminModel.js';
import { updateSpecialite } from '../models/adminModel.js';
import { updateNiveau } from '../models/adminModel.js';
import { updateModule } from '../models/adminModel.js';
import { dropUnniv } from '../models/adminModel.js';
import { dropFaculte } from '../models/adminModel.js';
import { dropDepartement } from '../models/adminModel.js';
import { dropFiliere } from '../models/adminModel.js';
import { dropSpecialite } from '../models/adminModel.js';
import { dropNiveau } from '../models/adminModel.js';
import { dropModule } from '../models/adminModel.js';
import { nbrUnniv } from '../models/adminModel.js';
import { nbrFaculte } from '../models/adminModel.js';
import { nbrDepartement } from '../models/adminModel.js';
import { nbrChef } from '../models/adminModel.js';
import jwt from 'jsonwebtoken'

import bicrypt from 'bcrypt';

export const loginAdmin = (req, res) => {
    try {
const { email, password } = req.body;

if (email == process.env.ADMIN_EMAIL && password == process.env.ADMIN_PASSWORD) {
  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return res.json({
    message: 'logged in',
    token: token,
  });
}


if (email !== process.env.ADMIN_EMAIL && password !== process.env.ADMIN_PASSWORD) {
  return res.json({ message: "email and password incorrect" });
} else if (email !== process.env.ADMIN_EMAIL) {
  return res.json({ message: "email not valid" });
} else if (password !== process.env.ADMIN_PASSWORD) {
  return res.json({ message: "password incorrect" });
}

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const deleteChef = async (req, res) => {
    try {
        const { idChef } = req.body;

        const user = await findChef(idChef);
        if (!user) {
            return res.status(404).json({ message: "Chef not exist" }); 
        }
        await removeChef(idChef); 

        return res.status(200).json({ message: "Chef deleted successfully" });

    } catch (error) {
        console.error(error);
        if (!res.headersSent) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
};
export const choisirChef = async (req, res) => {
    try {
        const { idChef, password } = req.body;

        if (!idChef || !password) {
            return res.status(400).json({ message: "idChef ou mot de passe manquant" });
        }

        const enseignant = await findEnsei(idChef);
        if (!enseignant) {
            return res.status(404).json({ message: "Enseignant non trouvé" });
        }

        const idDepartement = enseignant.idDepartement;
        if (!idDepartement) {
            return res.status(400).json({ message: "idDepartement introuvable pour cet enseignant" });
        }

        const chef = await chefExiste(idDepartement);
        if (chef[0]?.count > 0) {
            return res.status(409).json({ message: "Un chef existe déjà dans ce département" });
        }

        const enseignantId = enseignant.users_id;
        const enseignantEmail = enseignant.Email;
        const departementId = enseignant.idDepartement;
        const nomChef = enseignant.nomEnseignant;
        const prenomChef = enseignant.PrenomEnseignant;

        const hashPassword = await bicrypt.hash(password, 10);

        await addChef(enseignantId, enseignantEmail, hashPassword);
        await addToArchif(enseignantId, departementId, enseignantEmail, nomChef, prenomChef);
        await sendEmailByGoogle(enseignantEmail, nomChef, prenomChef, password);

        return res.status(200).json({ message: "Chef ajouté avec succès" });

    } catch (error) {
        console.error("Erreur dans choisirChef:", error);
        return res.status(500).json({ message: "Erreur interne du serveur" });
    }
}


export const ListeUnniversite = async (req , res) => {
    try{
        const unniv = await ListeUnniv()
        if(!unniv){
            res.send(error)
        }
        return res.send(unniv)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const ListeFaculte = async(req,res) => {
    try{
        const fac = await ListeFac()
        if(!fac){
            res.send(error)
        }
        return res.send(fac)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

}


export const ListeDepartement = async(req,res) => {
    try{
        const dep = await ListeDep()
        if(!dep){
            res.send(error)
        }
        return res.send(dep)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const ListeFiliere = async(req,res) => {
    try{
        const fil = await ListeFil()
        if(!fil){
            res.send(error)
        }
        return res.send(fil)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
} 


export const ListeNiveau = async(req,res) => {
    try{
        const niv = await ListeNiv()
        if(!niv){
            res.send(error)
        }
        return res.send(niv)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const ListeSpecialite = async(req,res) => {
    try{
        const spec = await ListeSpec()
        if(!spec){
            res.send(error)
        }
        return res.send(spec)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const ListeModule = async(req,res) => {
    try{
        const mod = await ListeMod()
        if(!mod){
            res.send(error)
        }
        return res.send(mod)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const showUnniv = async (req, res) => {
    try {
        const unniv = await showAllUnniv()
        if(!unniv){
           return res.send("unniversite not found")
        }
        res.send(unniv)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const addUnniv = async (req, res) => {
    try{
        const {nomUnniversite} = req.body
        const unniversite = await addUnniversite(nomUnniversite);
        if(!unniversite){
            res.send("unniversite not added")
        }
        res.send("unniversite added");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const showFaculte = async (req, res) => {
    try {
        const{nomUnniversite} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        
        if(!unniv){
            return res.send("unniversite not found");
        }
        const idUnniversite = unniv.idUnniversité;
        const fac = await showFaculteByUnniv(idUnniversite);
        if(!fac){
            return res.send("faculte not found");
        }
        return res.send(fac);
    }catch(error){
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
}


export const addFacul = async (req,res) => {
   try{
    const {nomUnniversite, nomFaculte} = req.body
    const unniv = await findUnniversite(nomUnniversite);
    if(!unniv){
        res.send("unniversite not found");
    }
    const idUnniversite = unniv.idUnniversité;
    const faculte = await addFaculte(idUnniversite, nomFaculte);
    if(!faculte){
        res.send("faculte not added");
    }
    res.send("faculte added");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const showDepartement = async (req, res) => {
    try {
        const {nomFaculte} = req.body
        const fac = await findFaculte(nomFaculte);
        if(!fac){
            res.send("faculte not found");
        }
        const idFaculte = fac.idFaculté
        const dep = await showDepartementByFaculte(idFaculte);
        if(!dep){
            res.send("departement not found")
        }
        res.send(dep)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
}


export const addDep = async (req,res) => {
    try{
        const{nomUnniversite , nomFaculte , nomDepartement} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            res.send("unniversite not found");
        }
        const fac = await findFaculte(nomFaculte);
        if(!fac){
            res.send("faculte not found");
        }
        const idUnniversite = unniv.idUnniversité;
        const idFaculte = fac.idFaculté;
        const dep = await addDepartement(idUnniversite, idFaculte, nomDepartement);
        if(!dep){
            res.send("departement not added");
        }
        res.send("departement added");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const shwoFiliere = async (req,res) => {
    try{
        const {nomDepartement} = req.body
        const dep = await findDepartement(nomDepartement);
        if(!dep){
            res.send("departement not found");
        }
        const idDep = dep.idDepartement;
        
        const fil = await showFiliereByDepartement(idDep);
        if(!fil){
            res.send("filiere not found")
        }

        res.send(fil)

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const addFil = async (req, res) => {
    try {
        const { nomUnniversite, nomFaculte, nomDepartement, nomFiliere } = req.body;

        const unniv = await findUnniversite(nomUnniversite);
        if (!unniv) return res.send("unniversite not found");

        const fac = await findFaculte(nomFaculte);
        if (!fac) return res.send("faculte not found");

        const dep = await findDepartement(nomDepartement);
        if (!dep) return res.send("departement not found");

        const idUnniversite = unniv.idUnniversité;
        const idFaculte = fac.idFaculté;
        const idDepartement = dep.idDepartement;

        const fil = await addfilière(idUnniversite, idFaculte, idDepartement, nomFiliere);
        if (!fil) return res.send("filiere not added");

        return res.send("filiere added");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const showSpecialite = async(req,res) => {
    try{
        const {nomFiliere} = req.body
        const fil = await findFiliere(nomFiliere);
        if(!fil){
            res.send("filiere not found");
        }

        const idFil = fil.idFilière
        const spe = await showSpecialiteByFiliere(idFil);
        if(!spe){
            res.send("specialite not found");
        }
        res.send(spe);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const addSpe = async (req, res) => {
    try {
        const { nomUnniversite, nomFaculte, nomDepartement, nomFiliere, nomSpecialite } = req.body;

        const unniv = await findUnniversite(nomUnniversite);
        if (!unniv) return res.send("unniversite not found");

        const fac = await findFaculte(nomFaculte);
        if (!fac) return res.send("faculte not found");

        const dep = await findDepartement(nomDepartement);
        if (!dep) return res.send("departement not found");

        const fil = await findFiliere(nomFiliere);
        if (!fil) return res.send("filiere not found");

        const idUnniversite = unniv.idUnniversité;
        const idFaculte = fac.idFaculté;
        const idDepartement = dep.idDepartement;
        const idFiliere = fil.idFilière;

        const spec = await addSpecialite(idUnniversite, idFaculte, idDepartement, idFiliere, nomSpecialite);
        if (!spec) return res.send("specialite not added");

        return res.send("specialite added");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" })
    }
};


export const showNiveau = async(req,res) => {
    try{
        const {nomSpecialite} = req.body
        const spe = await findSpecialite(nomSpecialite);
        if(!spe){
            return res.send("specialite not found");
        }
        const idSpecialite = spe.idSpécialité;
        const niv = await showNiveauBySpecialite(idSpecialite);
        if(!niv){
            return res.send("niveau not found");
        }
        return res.send(niv);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}



export const addNiv = async(req,res) =>{
    try{
        const{nomUnniversite , nomFaculte , nomDepartement , nomFiliere , nomSpecialite , nomNiveau} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            res.send("unniversite not found");
        }
        const fac = await findFaculte(nomFaculte);
        if(!fac){
            res.send("faculte not found");
        }
        const dep = await findDepartement(nomDepartement);
        if(!dep){
            res.send("departement not found");
        }
        const fil = await findFiliere(nomFiliere);
        if(!fil){
            res.send("filiere not found");
        }
        const spe = await findSpecialite(nomSpecialite);
        if(!spe){
            res.send("specialite not found");
        }
        const idUnniversite = unniv.idUnniversité;
        const idFaculte = fac.idFaculé;
        const idDepartement = dep.idDepartement;
        const idFiliere = fil.idFilière;
        const idSpecialite = spe.idSpécialité;
        const niv = await addNiveau(idUnniversite, idFaculte, idDepartement, idFiliere, idSpecialite, nomNiveau);
        if(!niv){
            res.send("niveau not added");
        }
        res.send("niveau added");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const showModule = async(req,res) => {
    try{
        const {nomNiveau} = req.body
        const niv = await findNiveau(nomNiveau);
        if(!niv){
            res.send("niveau not found");
        }
        const idNiveau = niv.idNiveau;
        const mod = await showModuleByNiveau(idNiveau);
        if(!mod){
            res.send("module not found");
        }
        res.send(mod);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const addMod = async(req,res) =>{
    try {
        const {
            nomUnniversite, nomFaculte, nomDepartement,
            nomFiliere, nomSpecialite, nomNiveau, nomModule
        } = req.body;

        const unniv = await findUnniversite(nomUnniversite);
        if (!unniv) return res.send("unniversite not found");

        const fac = await findFaculte(nomFaculte);
        if (!fac) return res.send("faculte not found");

        const dep = await findDepartement(nomDepartement);
        if (!dep) return res.send("departement not found");

        const fil = await findFiliere(nomFiliere);
        if (!fil) return res.send("filiere not found");

        const spe = await findSpecialite(nomSpecialite);
        if (!spe) return res.send("specialite not found");

        const niv = await findNiveau(nomNiveau);
        if (!niv) return res.send("niveau not found");

        const idUnniversite = unniv.idUnniversité;
        const idFaculte = fac.idFaculté;
        const idDepartement = dep.idDepartement;
        const idFiliere = fil.idFilière;
        const idSpecialite = spe.idSpécialité;
        const idNiveau = niv.idNiveau;

        const mod = await addModule(
            idUnniversite, idFaculte, idDepartement,
            idFiliere, idSpecialite, idNiveau, nomModule
        );

        if (!mod) return res.send("module not added");

        return res.send("module added");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const showArchifChef = async (req, res) => {
    try {
        const archif = await showArchif();
        res.status(200).json(archif);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const findEnsToChooseChef = async (req, res) => {
    try {
        const { nomUnniversite, nomFaculte, nomDepartement } = req.body;
        const unniv = await findUnniversite(nomUnniversite);
        if (!unniv) {
            return res.status(404).json({ message: "University not found" });
        }
        const fac = await findFaculte(nomFaculte);
        if (!fac) {
            return res.status(404).json({ message: "Faculty not found" });
        }
        const dep = await findDepartement(nomDepartement);
        if (!dep) {
            return res.status(404).json({ message: "Department not found" });
        }
        const enseignant = await chooseEnsByUnniFacDep(unniv.idUnniversité, fac.idFaculté, dep.idDepartement);
        if (!enseignant) {
            return res.status(404).json({ message: "No teacher found" });
        }
        

        res.status(200).json(enseignant);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const showChef = async (req, res) => {
    try{
        const chef = await find()
        if(!chef){
            res.send("chef not exist")
        }
        res.send(chef)
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const findChefByEnseignant = async (req, res) => {
    try {
        const { idEnseignant } = req.body;

        const idDep = await findEnseignantDep(idEnseignant);
        const chef = await findChefByDep(idDep.idDepartement);
        
        if (!chef) {
            return res.status(404).json({ message: "Chef not found" });
        }

        return res.status(200).json(chef);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const modifierUnniversite = async (req,res) => {
    try{
        const {idUnniversite, nomUnniversite} = req.body;
        const unniv = await findUnniversite(nomUnniversite);
        if(unniv){
            return res.send("unniversite already exist")
        }
        const unniversite = await updateUnniv(idUnniversite, nomUnniversite);
        if(!unniversite){
            return res.send("unniversite not updated")
        }
        return res.send("unniversite updated")
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const modifierFaculte = async (req,res) => {
    try{
        const {idFaculte,nomUnniv , nomFaculte} = req.body;
        
        const unniv = await findUnniversite(nomUnniv);
        
        if(!unniv){
            return res.send("unniversite not found")
        }
        const idUnniversite = unniv.idUnniversité
        
        const fac = await updateFaculte(idFaculte,idUnniversite, nomFaculte)
        if(!fac){
            return res.send("faculte not updated")
        }
        return res.send("faculte updated")
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const modifierDepartement = async (req,res) => {
    try{
        const {nomUnniversite , nomFaculte , nomDepartement , idDepartement} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            return res.send("unniversite not found")
        }
        const idUnniversite = unniv.idUnniversité;
        const faculte = await findFaculte(nomFaculte);
        if(faculte){
            return res.send("faculte already exist")
        }
        const idFac = faculte.idFaculté

        await updateDepartement(idUnniversite, idFac, nomDepartement , idDepartement);
        return res.send("departement updated")

    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const modifierFiliere = async (req,res) => {
    try{
        const {nomUnniversite , nomFaculte , nomDepartement , nomFiliere , idFiliere} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            return res.send("unniversite not found")
        }
        const idUnniversite = unniv.idUnniversité;
        const faculte = await findFaculte(nomFaculte);
        if(!faculte){
            return res.send("faculte not found")
        }
        const idFac = faculte.idFaculté
        const dep = await findDepartement(nomDepartement);
        if(!dep){
            return res.send("departement not found")
        }
        const idDep = dep.idDepartement
        await updateFiliere(idUnniversite, idFac, idDep, nomFiliere , idFiliere);
        return res.send("filiere updated")
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const modifierSpecialite = async (req,res) => {
    try{
        const {nomUnniversite , nomFaculte , nomDepartement , nomFiliere , nomSpecialite , idSpecialite} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            return res.send("unniversite not found")
        }
        const idUnniversite = unniv.idUnniversité;
        const faculte = await findFaculte(nomFaculte);
        if(!faculte){
            return res.send("faculte not found")
        }
        const idFac = faculte.idFaculté
        const dep = await findDepartement(nomDepartement);
        if(!dep){
            return res.send("departement not found")
        }
        const idDep = dep.idDepartement
        const fil = await findFiliere(nomFiliere);
        if(!fil){
            return res.send("filiere not found")
        }
        const idFil = fil.idFilière
        await updateSpecialite(idUnniversite, idFac, idDep, idFil, nomSpecialite , idSpecialite);
        return res.send("specialite updated")
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const modifierNiveau = async (req , res) => {
    try{
        const { nomUnniversite , nomFaculte , nomDepartement , nomFiliere , nomSpecialite , nomNiveau , idNiveau} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            return res.send("unniversite not found")
        }
        const idUnniversite = unniv.idUnniversité;
        const faculte = await findFaculte(nomFaculte);
        if(!faculte){
            return res.send("faculte not found")
        }
        const idFac = faculte.idFaculté
        const dep = await findDepartement(nomDepartement);
        if(!dep){
            return res.send("departement not found")
        }
        const idDep = dep.idDepartement
        const fil = await findFiliere(nomFiliere);
        if(!fil){
            return res.send("filiere not found")
        }
        const idFil = fil.idFilière
        const spe = await findSpecialite(nomSpecialite)
        if(!spe){
            return res.send("specialite not found")
        }
        const idSpe = spe.idSpécialité
        await updateNiveau(idUnniversite, idFac, idDep, idFil, idSpe, nomNiveau , idNiveau);
        return res.send("niveau updated")
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

}

export const modifierModule = async (req,res) => {
    try{
        const {nomUnniversite , nomFaculte , nomDepartement , nomFiliere , nomSpecialite , nomNiveau , nomModule , idModule} = req.body
        const unniv = await findUnniversite(nomUnniversite);
        if(!unniv){
            return res.send("unniversite not found")
        }
        const idUnniversite = unniv.idUnniversité;
        const faculte = await findFaculte(nomFaculte);
        if(!faculte){
            return res.send("faculte not found")    
        }
        const idFac = faculte.idFaculté
        const dep = await findDepartement(nomDepartement);
        if(!dep){
            return res.send("departement not found")
        }
        const idDep = dep.idDepartement
        const fil = await findFiliere(nomFiliere);
        if(!fil){
            return res.send("filiere not found")
        }
        const idFil = fil.idFilière
        const spe = await findSpecialite(nomSpecialite)
        if(!spe){
            return res.send("specialite not found")
        }
        const idSpe = spe.idSpécialité
        const niv = await findNiveau(nomNiveau);
        if(!niv){
            return res.send("niveau not found")
        }
        const idNiv = niv.idNiveau
        await updateModule(idUnniversite, idFac, idDep, idFil, idSpe, idNiv, nomModule , idModule);
        return res.send("module updated")
    }catch(error){
        console.error(error); 
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerUnniversite = async (req,res) => {
    try{
        const {idUnniversite} = req.body;
        await dropUnniv(idUnniversite)
        return res.send("supprimer");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerFaculte = async (req,res) => {
    try{
        const {idFaculte} = req.body;
        await dropFaculte(idFaculte);

        return res.send("faculte supprimer ");
    }catch(error){
        console.error(error); 
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerDepartement = async (req,res) => {
    try{
        const {idDepartement} = req.body;
        await dropDepartement(idDepartement);
        
        return res.send("supprimer");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerFiliere = async (req,res) => {
    try{
        const {idFiliere} = req.body;
        await dropFiliere(idFiliere);
        return res.send("supprimer");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerSpecialite = async (req,res) => {
    try{
        const {idSpecialite} = req.body;
        await dropSpecialite(idSpecialite);
        return res.send("supprimer");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerNiveau = async (req,res) => {
    try{
        const {idNiveau} = req.body;
        await dropNiveau(idNiveau);
        return res.send("supprimer");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const supprimerModule = async (req,res) => {
    try{
        const {idModule} = req.body;
        await dropModule(idModule);
        
        return res.send("supprimer");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const countUnniversite = async (req,res) => {
    try{
        const count = await nbrUnniv()
        if(!count){
            res.send("not found")
        }
        res.send({ count })
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const countFaculte = async (req,res) => {
    try{
        const count = await nbrFaculte()
        if(!count){
            res.send("not found")
        }
        res.send({ count })
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const countDepartement = async (req,res) => {
    try{
        const count = await nbrDepartement()
        if(!count){
            res.send("not found")
        }
        res.send({ count })
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const countChef = async (req,res) => {
    try{
        const count = await nbrChef()
        if(!count){
            res.send("not found")
        }
        res.send({ count })
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
}