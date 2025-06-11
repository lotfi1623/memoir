import express from 'express';
import {accepterVacateur,refuserVacateur,listeVacateurNoAccepted} from '../controllers/chefController.js';
import { listeEnseignant,chefDepartementLogin} from '../controllers/chefController.js';
import { listeVacateurAccepted } from '../controllers/chefController.js';
import { calculeSomme } from '../controllers/chefController.js';
import { calculeSommeParMois } from '../controllers/chefController.js';
import { calculeSommeById } from '../controllers/chefController.js'
import { nombreVacateurNoAccepted } from '../controllers/chefController.js';
import { nombreEnseignant } from '../controllers/chefController.js';
import { nombreVacateurAccepted } from '../controllers/chefController.js';
import { showChefById } from '../controllers/chefController.js';
import { updateChefById } from '../controllers/chefController.js';

const router = express.Router();

router.post('/login',chefDepartementLogin);
router.post('/accepter',accepterVacateur);
router.post('/refuser',refuserVacateur);
router.post('/NoAccepter/count',nombreVacateurNoAccepted);   
router.post('/listeVacateur',listeVacateurNoAccepted);
router.post('/enseignant/count',nombreEnseignant);
router.post('/listeEnseignant',listeEnseignant);
router.post('/accepter/count',nombreVacateurAccepted);
router.post('/listeVacateurAccepter',listeVacateurAccepted);
router.post('/calcule',calculeSomme)
router.post('/sommeParMois',calculeSommeParMois)
router.post('/sommeParMoisById',calculeSommeById)
router.post('/showChefInfo',showChefById)
router.post('/updateChef',updateChefById);



export default router;