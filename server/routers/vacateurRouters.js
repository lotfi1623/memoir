import express from 'express';
import {vacateurInscrir,supprimerDemendes} from'../controllers/vacateurController.js';
import {voirDemende} from'../controllers/vacateurController.js';
import {vacateurNoAccepter} from'../controllers/vacateurController.js';
import {vacateurAccepter} from'../controllers/vacateurController.js';
const router = express.Router();


router.post('/inscrir',vacateurInscrir);
router.post('/supprimer',supprimerDemendes);
router.post('/voir/demende',voirDemende);
router.post('/accepter',vacateurAccepter)
router.post('/noAccepter',vacateurNoAccepter)


export default router;