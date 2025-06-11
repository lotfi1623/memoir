import express from 'express';
import {choisirChef,deleteChef,addUnniv,addFacul,addDep,addFil,addSpe,addNiv,addMod,loginAdmin,showArchifChef, ListeUnniversite} from '../controllers/adminController.js';
import {findEnsToChooseChef} from '../controllers/adminController.js';
import {showChef} from '../controllers/adminController.js';
import {showFaculte} from '../controllers/adminController.js';
import {showDepartement} from '../controllers/adminController.js';
import {showUnniv} from '../controllers/adminController.js';
import {shwoFiliere} from '../controllers/adminController.js';
import {showSpecialite} from '../controllers/adminController.js';
import {showNiveau} from '../controllers/adminController.js';
import {showModule} from '../controllers/adminController.js';
import {ListeFaculte} from '../controllers/adminController.js';
import {ListeDepartement} from '../controllers/adminController.js';
import {ListeFiliere} from '../controllers/adminController.js';
import {ListeSpecialite} from '../controllers/adminController.js';
import {ListeNiveau} from '../controllers/adminController.js';
import {ListeModule} from '../controllers/adminController.js';
import {findChefByEnseignant} from '../controllers/adminController.js';
import {modifierUnniversite} from '../controllers/adminController.js';
import {modifierFaculte} from '../controllers/adminController.js';
import {modifierDepartement} from '../controllers/adminController.js';
import {modifierFiliere} from '../controllers/adminController.js';
import {modifierSpecialite} from '../controllers/adminController.js';
import {modifierNiveau} from '../controllers/adminController.js';
import {modifierModule} from '../controllers/adminController.js';
import {supprimerUnniversite} from '../controllers/adminController.js';
import {supprimerFaculte} from '../controllers/adminController.js';
import {supprimerDepartement} from '../controllers/adminController.js';
import {supprimerFiliere} from '../controllers/adminController.js';
import {supprimerSpecialite} from '../controllers/adminController.js';
import {supprimerNiveau} from '../controllers/adminController.js';
import {supprimerModule} from '../controllers/adminController.js';
import {countUnniversite} from '../controllers/adminController.js';
import {countFaculte} from '../controllers/adminController.js';
import {countDepartement} from '../controllers/adminController.js';
import {countChef} from '../controllers/adminController.js';


const router = express.Router();

router.post('/adminonly', loginAdmin);

router.post('/choisir',choisirChef);
router.post('/findEnseignant',findEnsToChooseChef);
router.post('/delete',deleteChef);
router.post('/modifier/unniversite',modifierUnniversite)
router.post('/modifier/faculte',modifierFaculte);
router.post('/modifier/departement',modifierDepartement);
router.post('/modifier/filiere',modifierFiliere);
router.post('/modifier/specialite',modifierSpecialite);
router.post('/modifier/niveau',modifierNiveau);
router.post('/modifier/module',modifierModule);
router.post('/supprimer/unniversite',supprimerUnniversite);
router.post('/supprimer/faculte',supprimerFaculte);
router.post('/supprimer/departement',supprimerDepartement);
router.post('/supprimer/filiere',supprimerFiliere);
router.post('/supprimer/specialite',supprimerSpecialite);
router.post('/supprimer/niveau',supprimerNiveau);
router.post('/supprimer/module',supprimerModule);
router.post('/liste/unniversite',ListeUnniversite);
router.post('/liste/faculte',ListeFaculte);
router.post('/liste/departement',ListeDepartement);
router.post('/liste/filiere',ListeFiliere);
router.post('/liste/specialite',ListeSpecialite);
router.post('/liste/niveau',ListeNiveau);
router.post('/liste/module',ListeModule);
router.post('/show/Unniv',showUnniv);
router.post('/addunniversite',addUnniv);
router.post('/show/fac',showFaculte)
router.post('/addFaculte',addFacul);
router.post('/show/departement',showDepartement)
router.post('/addDepartement',addDep);
router.post('/show/filiere',shwoFiliere);
router.post('/addFiliere',addFil);
router.post('/show/specialite',showSpecialite);
router.post('/addSpecialite',addSpe);
router.post('/show/niveau',showNiveau);
router.post('/addNiveau',addNiv);
router.post('/show/module',showModule);
router.post('/addModule',addMod);
router.post('/show',showArchifChef);
router.post('/showChef',showChef);
router.post('/showEnsByChef',findChefByEnseignant);
router.post('/count/unniversite',countUnniversite)
router.post('/count/faculte',countFaculte);
router.post('/count/departement',countDepartement);
router.post('/count/chef',countChef);

export default router;