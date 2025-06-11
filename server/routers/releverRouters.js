import express from 'express';
import { afficheModule,afficheNiveau,afficheSpecialite,afficheReleverNoVerifier } from '../controllers/releverController.js';
import { afficheReleverByChef } from '../controllers/releverController.js';
import { nombreHeureNonValide } from '../controllers/releverController.js';
import { verifierHeure } from '../controllers/releverController.js';
import { afficheReleverVerifier } from '../controllers/releverController.js';
import { modifierHeures } from '../controllers/releverController.js';
import { showHeureByEnseignant } from '../controllers/releverController.js';
import { errorDeSaisir} from '../controllers/releverController.js'
import { afficheReleverError } from '../controllers/releverController.js';
import {countRelever} from '../controllers/releverController.js'

const router = express.Router();

router.post('/module',afficheModule);
router.post('/specialite',afficheSpecialite);
router.post('/niveau',afficheNiveau);
router.post('/affiche',afficheReleverNoVerifier);
router.post('/affiche/departement',afficheReleverByChef);
router.post('/num/noVerifier',nombreHeureNonValide);
router.post('/verifier',verifierHeure)
router.post('/affiche/verifier',afficheReleverVerifier)
router.post('/modifier',modifierHeures)
router.post('/affiche/enseignant',showHeureByEnseignant)
router.post('/error',errorDeSaisir)
router.post('/affiche/error',afficheReleverError)
router.post('/count',countRelever)
export default router;
