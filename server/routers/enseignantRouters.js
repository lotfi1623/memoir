import express from 'express';
import {modifierEnseignant , saisirHeure ,showEnseignant} from '../controllers/enseignantController.js';
import {showEnseignantNoEnattent} from '../controllers/enseignantController.js'
const router = express.Router();

router.post('/show',showEnseignant);
router.post('/modifier',modifierEnseignant);
router.post('/relever',saisirHeure);
router.post('/show/enattent',showEnseignantNoEnattent)


export default router;