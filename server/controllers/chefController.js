import { accepteVacateur} from "../models/chefModel.js";
import { refuseVacateur } from "../models/chefModel.js";
import {ShowVacateur} from "../models/chefModel.js";
import {showEnseignant} from "../models/chefModel.js";
import {chefLogin} from "../models/chefModel.js";
import {sendEmailToVacateur} from '../ResendService.js';
import { finVacateur } from "../models/chefModel.js";
import {showVacateurByIdDep} from "../models/chefModel.js"
import {showVacateurAccepter} from "../models/chefModel.js"
import {sommeValeur} from "../models/chefModel.js";
import {sommeValeurParMois} from "../models/chefModel.js";
import { maxHeure} from "../models/enseignantModel.js";
import {sommeValeurParMoisById} from "../models/chefModel.js"
import { heureTotal } from "../models/chefModel.js";
import { countEnseignant} from "../models/chefModel.js";  
import { countVacateur } from "../models/chefModel.js";
import { countVacateurAccepter } from "../models/chefModel.js"; 
import { FindId } from "../models/chefModel.js";
import { modifierChef } from "../models/chefModel.js";
import { modifierEnseignant } from "../models/chefModel.js";
import {findChefEnseignant} from "../models/chefModel.js";


import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



export const accepterVacateur = async (req, res) => {
    try {
        const { idEnseignant } = req.body;
        const enseignant = await finVacateur(idEnseignant);
        if (!enseignant) {
            return res.status(404).json({ message: "Enseignant not found" });
        }
        const email = enseignant.Email;
        const nom = enseignant.nomEnseignant;
        const prenom = enseignant.PrenomEnseignant;
        await accepteVacateur(idEnseignant);
        await sendEmailToVacateur(email, nom, prenom);
        res.status(200).json({ message: "Vacateur accepted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};
export const refuserVacateur = async (req, res) => {
    try{
        const { idEnseignant } = req.body;
        await refuseVacateur(idEnseignant);
        res.status(200).json({ message: "Vacateur refused" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

};
export const listeVacateurNoAccepted = async (req, res) => {
    try {
        const { idChef } = req.body;
        const idDepartement = await showVacateurByIdDep(idChef);

        if (!idDepartement) {
            return res.status(404).json({ message: "Département non trouvé pour ce chef." });
        }

        

        const vacateurs = await ShowVacateur(idDepartement);
        

        res.send(vacateurs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const nombreVacateurNoAccepted = async (req, res) => {
    try {
        const {idChef} = req.body;
        const vacateur = await showVacateurByIdDep(idChef);
        if (!vacateur) {
            return res.status(404).json({ message: "Vacateur not found" });
        }
        
        
        const ens = await countVacateur(vacateur);
        res.send(ens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const listeVacateurAccepted = async (req, res) => {
    try {
        const {idChef} = req.body;
        const vacateur = await showVacateurByIdDep(idChef);
        if (!vacateur) {
            return res.status(404).json({ message: "Vacateur not found" });
        }
        
        
        const ens = await showVacateurAccepter(vacateur);
        res.send(ens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const nombreVacateurAccepted = async (req, res) => {
    try {
        const {idChef} = req.body;
        const vacateur = await showVacateurByIdDep(idChef);
        if (!vacateur) {
            return res.status(404).json({ message: "Vacateur not found" });
        }
        
        
        const ens = await countVacateurAccepter(vacateur);
        res.send(ens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const listeEnseignant = async (req, res) => {
    try {
        const {idChef} = req.body;
        const vacateur = await showVacateurByIdDep(idChef);
        if (!vacateur) {
            return res.status(404).json({ message: "Vacateur not found" });
        }
        
        
        const ens = await showEnseignant(vacateur);
        res.send(ens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const nombreEnseignant = async (req, res) => {
    try {
        const {idChef} = req.body;
        const vacateur = await showVacateurByIdDep(idChef);
        if (!vacateur) {
            return res.status(404).json({ message: "Vacateur not found" });
        }
        
        
        const ens = await countEnseignant(vacateur);
        res.send(ens);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}




export const chefDepartementLogin = async (req, res) => {
    try {
      const { emailUser, mdpUser } = req.body;
  
      if (!emailUser || !mdpUser) {
        return res.status(400).json({ message: "Email et mot de passe sont requis." });
      }
  
      const chef = await chefLogin(emailUser);
      
  
      if (!chef.length) {
        return res.status(404).json({ message: "Chef not found." });
      }
  
      const mdp = chef[0].password;
      const match = await bcrypt.compare(mdpUser, mdp);
  
      if (!match) {
        return res.status(400).json({ message: "Wrong password." });
      }
  
      const token = jwt.sign({ emailUser: emailUser }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  
      return res.json({
        message: 'Logged in',
        token: token,
        id: chef[0].users_id,
        userType: 'chef_departement',
        idUnniversite: chef[0].idUnniversite,
        idFaculte: chef[0].idFaculte,
        status: chef[0].status
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };



export const calculeSomme = async(req , res) => {
    try {
        const { idChef } = req.body;
        const chef = await chefLogin(idChef);
        if (!chef) {
          return res.send("chef not found");
        }
        const idDep = await showVacateurByIdDep(idChef);
        if (!idDep) {
            return res.send("departement not found");
        }

      const valeurs = await sommeValeur(idDep);
  
      if (!valeurs) {
        return res.send("no values found");
      }
      
      
      res.send(valeurs);
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }


  export const calculeSommeParMois = async (req, res) => {
    try {
      const { idChef } = req.body;
      const chef = await chefLogin(idChef);
      if (!chef) {
        return res.send("chef not found");
      }
  
      const idDep = await showVacateurByIdDep(idChef);
      if (!idDep) {
        return res.send("departement not found");
      }
  
      const valeurs = await sommeValeurParMois(idDep);
  
      if (!valeurs) {
        return res.send("no values found");
      }
  
      return res.send(valeurs);
    } catch (error) {
      console.error(error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  };
  


  export const calculeSommeById = async(req , res) => {
    try{
        const{id , mois} = req.body;
        const heure = await sommeValeurParMoisById(id , mois)
        if(!heure){
            res.send("heure not find")
        }
        

        const testH = await heureTotal(id , mois)
        if(!testH){
            res.send("not find")
        }
        
        const max = await maxHeure()
        if(!max){
            res.send("maxheure not find")
        }


        const maxH = max.maxHeureParMois

        if(testH > maxH){
            res.send(`vous avez depasser le nombre d'heure par mois`)
            
        }else{
            res.send(heure)
        }
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
  } 
  
  export const showChefById = async (req, res) => {
    try {
        const { idChef } = req.body;
        const chef = await FindId(idChef);
        if (!chef) {
            return res.send("chef not found");
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }}


export const updateChefById = async (req, res) => {
    try {
        const { idChef, nom, prenom, email,date } = req.body;
        await modifierChef(idChef,email);

        const idEns = await findChefEnseignant(idChef);
        
        if (!idEns) {
            return res.send("enseignant not found");
        }

        const enseignant = await modifierEnseignant(idEns, nom, prenom, date);
        if (!enseignant) {
            return res.send("enseignant not found");
        }

        res.send("chef updated successfully");
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
