import { modifierEns} from "../models/enseignantModel.js";
import { modifier } from "../models/enseignantModel.js";
import {saisir} from "../models/enseignantModel.js";
import { findEnseignant } from "../models/enseignantModel.js";
import { showEnsei } from "../models/enseignantModel.js";
import { findNiveau } from "../models/vacateurModel.js";
import { FindModule } from "../models/vacateurModel.js";
import { findSpecialite } from "../models/vacateurModel.js";
import {divisionTime} from "../models/enseignantModel.js";
import { sommeValeurById } from "../models/chefModel.js";
import { maxHeure } from "../models/enseignantModel.js";
import {showEnseign} from "../models/enseignantModel.js";



export const modifierEnseignant = async (req, res) => {
    try {
        const { idEnseignant, email, DateDeNaissance} = req.body;
        
        const mod = await modifierEns(idEnseignant,email, DateDeNaissance);
        return res.status(200).json({ message: "infornation modifier avec seccu" });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const saisirHeure = async(req , res) =>{
    try{
        const{id, niveau , specialite , module , Début , Fin , type , sujet } = req.body
        
        const user = await findEnseignant(id)
        if(!user){
           return res.send("enseignant not find");
        }
        const d = new Date();
        const date = d.getFullYear() + "/" + (d.getMonth() + 1) + "/" + d.getDate();
        const ens = user.users_id

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
        let valeur = 0;
        if(type === "Cours"){
            valeur = 90
        }else if(type === "TD"){
            valeur = 60
        }else if (type === "TP") {
                const somme = await divisionTime(Début, Fin)
              
                if (somme === '3:0' || somme === '3:00') {
                  valeur = 90
                } else if (somme === "2:0" || somme === "2:00") {
                  valeur = 60
                } else if (somme === "1:30") {
                  valeur = 45
                }
        }
        const value = await maxHeure()
        if(!value){
            return res.send("maxHeure not find")
        }
        const max = value.maxHeureParSemaine
        const sommeVal = await sommeValeurById(id)
        if(sommeVal > max){
            return res.send(`vous avez depasser le nombre d'heure par semaine`)
            
        }else{
            await saisir(ens , date ,  Début , Fin , idNiveau , idSpecialite  , type , idModule , sujet,valeur,0 )
            return res.send("enregistrement avec recu")
        }

        
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" })
    }
}


export const showEnseignant = async(req , res) =>{
    try{
        const { idEnseignant } = req.body;
        const ens = await showEnsei(idEnseignant);

        if (!ens) {
            
            return res.status(404).json({});
        }        
        if (Array.isArray(ens)) {
            if (ens.length === 0) {
                return res.status(404).json({});
            }
            return res.json(ens);
        }

        res.json(ens);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const showEnseignantNoEnattent = async(req,res)=>{
    try{
        const { idEnseignant } = req.body;
        const ens = await showEnseign(idEnseignant);

        if (!ens) {
            
            return res.status(404).json({});
        }        
        if (Array.isArray(ens)) {
            if (ens.length === 0) {
                return res.status(404).json({});
            }
            return res.json(ens);
        }

        res.json(ens);
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

