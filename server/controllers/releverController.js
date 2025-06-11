import { chefLogin } from "../models/chefModel.js";
import { FindEnseignantNiveau , findEnseignantModule , FindEnseignantSpecialite, heureValider } from "../models/releverModel.js";
import { afficheReleverById } from "../models/releverModel.js";
import { afficheReleverByDepartement } from "../models/releverModel.js";
import { showVacateurByIdDep } from "../models/chefModel.js";
import { nHeureNoValid } from "../models/releverModel.js";
import { verifierHeureById } from "../models/releverModel.js";
import {updateHeure} from "../models/releverModel.js";
import { findNiveau } from "../models/vacateurModel.js";
import { FindModule } from "../models/vacateurModel.js";
import { findSpecialite } from "../models/vacateurModel.js";
import { afficher } from "../models/releverModel.js";
import { releverError } from "../models/releverModel.js";
import { showError } from "../models/releverModel.js";
import {informtion} from "../models/releverModel.js"
import {showErrorEnseignant} from "../models/releverModel.js"
import {sendEmailErrorToEnseignant} from "../ResendService.js"
  

export const afficheSpecialite = async(req , res) =>{
    try{
        const { idEnseignant } = req.body;
        const ens = await FindEnseignantSpecialite(idEnseignant);
        res.send( ens );
    } catch(error) {
        console.error("Specialite error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const afficheNiveau = async (req , res) =>{
    try{
        const { idEnseignant } = req.body;
        const ens = await FindEnseignantNiveau(idEnseignant)
        res.send(ens);
    } catch(error) {
        console.error("Niveau error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



export const afficheReleverNoVerifier = async (req , res) =>{
    try{
        const{idEnseignant} = req.body;
        const ens = await afficheReleverById(idEnseignant);

        if(!ens){
            res.send("relever not find")
        }

        res.send(ens);
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}   

export const afficheReleverVerifier = async (req , res) =>{
    try{
        const{idEnseignant} = req.body;
        const ens = await verifierHeureById(idEnseignant);

        if(!ens){
            res.send("relever not find")
        }

        res.send(ens);
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}   

export const afficheReleverError = async (req , res) =>{
    try{
        const{idEnseignant} = req.body;
        const ens = await showError(idEnseignant);

        if(!ens){
            res.send("relever not find")
        }

        res.send(ens);
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}   

export const afficheReleverByChef = async (req , res) =>{
    try{
        const{idChef} = req.body;
        const ens = await chefLogin(idChef);
        if(!ens){
            res.send("relever not find")
        }
        const idDep = await showVacateurByIdDep(idChef);
        if(!idDep){
            res.send("departement not find")
        }
        const relever = await afficheReleverByDepartement(idDep);
        if(!relever){
            res.send("relever not find")
        }
        res.send(relever);



    }catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const afficheModule = async (req, res) => {
    try {
      const { idEnseignant } = req.body;
      const modules = await findEnseignantModule(idEnseignant);
      res.json({ modules });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }


  export const nombreHeureNonValide = async (req, res) => {
    try {
      const nHeure = await nHeureNoValid();
  
      if (!nHeure) {
        return res.status(404).json({ message: "Relevé non trouvé" });
      }
  
      return res.status(200).json({ nHeure });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
  export const verifierHeure = async (req, res) => {
    try {
      const { idRelever } = req.body;
      await heureValider(idRelever);
  
      return res.send("heure valider");
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

  export const modifierHeures = async (req, res) => {
    try {
        const{idRelever ,niveau , specialite , module , Début , Fin , type , sujet } = req.body;
        
        
        
        const niv = await findNiveau(niveau);
        if(!niv){
            return res.send("niveau not find");
        }
        const idNiveau = niv.idNiveau;
                
        const spec = await findSpecialite(specialite);
        if(!spec){
            return res.send("specialite not find");
        }
        const idSpecialite = spec.idSpécialité;
                
        const mod = await FindModule(module);
        
        if(!mod){
            return res.send("module not find");
        }
        const idModule = mod.idModule;
        await updateHeure(idRelever, idModule, idNiveau, idSpecialite, Début, Fin, type, sujet)
        return res.send("heure modifier avec seccu");
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const showHeureByEnseignant = async (req, res) => {
    try {
        const { idEnseignant } = req.body;
        const heures = await afficher(idEnseignant);
        if (!heures) {
            return res.status(404).json({ message: "Heures not found" })
        }
        res.send(heures);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const errorDeSaisir = async(req,res) => {
    try{
        const{idRel} = req.body
        await releverError(idRel)
        const [enseignant] = await showErrorEnseignant(idRel);
        const nom = enseignant.nomEnseignant;
        const prenom = enseignant.PrenomEnseignant;
        const email = enseignant.Email;
        const debut = enseignant.Début
        const fin = enseignant.Fin
        const type = enseignant.Type
        const date = enseignant.Date
        const module = enseignant.Nom_module;
        await sendEmailErrorToEnseignant(email, nom, prenom, debut, fin, type, date, module)
        return res.send({ nom, prenom, email , debut , fin,date , type , module });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const countRelever = async(req,res) => {
    try{
        const info = await informtion()
        return res.json({info})
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}