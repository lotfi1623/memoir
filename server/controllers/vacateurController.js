import {inscription,findFiliere,findDepartement,FindModule,findNiveau,findSpecialite,voir} from '../models/vacateurModel.js';
import {findUser} from '../models/userLoginSignup.js';  
import {supprimerVacateur} from '../models/vacateurModel.js';
import {vacateurAcc} from '../models/vacateurModel.js';
import {vacateurNoAcc} from '../models/vacateurModel.js';
import {findUs} from '../models/userLoginSignup.js';
export const vacateurInscrir = async (req, res) => {
    try {
        const { email, nomDepartement, nomfiliere, nomSpecialite, nomNiveau, nomModule, nom, prenom, dateDeNecaence, rang } = req.body;
        
        const users = await findUs(email);
        if (!users) {
            return res.status(404).json({ message: "User not found" })
        }

        const fil = await findFiliere(nomfiliere);
        if (!fil) {
            return res.status(404).json({ message: "Filiere not found" });
        }

        const dep = await findDepartement(nomDepartement);
        if (!dep) {
            return res.status(404).json({ message: "Departement not found" });
        }

        const mod = await FindModule(nomModule);
        if (!mod) {
            return res.status(404).json({ message: "Module not found" });
        }

        const niv = await findNiveau(nomNiveau);
        if (!niv) {
            return res.status(404).json({ message: "Niveau not found" });
        }

        const spe = await findSpecialite(nomSpecialite);
        if (!spe) {
            return res.status(404).json({ message: "Specialite not found" });
        }

        const user = users.users_id;
        const unniv = users.idUnniversité;
        const fac = users.idFaculté;
        const depart = dep.idDepartement;
        const filiere = fil.idFilière;
        const specialite = spe.idSpécialité;
        const niveau = niv.idNiveau;
        const module = mod.idModule;

        await inscription(user, unniv, fac, depart, filiere, specialite, niveau, module, nom, prenom, dateDeNecaence, email, rang,0);

        return res.send("Inscription successful" );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const supprimerDemendes = async (req, res) => {
    try {
        const { idUser } = req.body;

        await supprimerVacateur(idUser);

        res.status(200).json({ message: "demende supprimer" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const voirDemende = async (req, res) => {
    try {
        const { idUser } = req.body;

        const demende = await voir(idUser);
        if (!demende) {
            return res.status(404).json({ message: "Demende not found" });
        }

        res.status(200).json(demende);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const vacateurAccepter = async (req, res) => {
    try {
        const { idUser } = req.body;
        const demende = await vacateurAcc(idUser);

        if (!demende || demende.length === 0) {
            return res.status(404).json({
                status: "error",
                msg: "demande not found"
            });
        }

        const hasEtat1 = demende.some(item => item.Etat === 1);

        const redirectionPath = hasEtat1 ? "/DashbordEns" : "/auth/pending";

        return res.status(200).json({
            status: "success",
            msg: `go to ${redirectionPath}`
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: "error",
            msg: "Internal server error"
        });
    }
};



export const vacateurNoAccepter = async (req, res) => {
    try {
        const { idUser } = req.body;
        const demende = await vacateurNoAcc(idUser);

        if (!demende) {
            return res.status(404).json({ message: "Demande not found" });
        }

        return res.status(200).json(0); 

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
