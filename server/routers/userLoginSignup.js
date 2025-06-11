import express from 'express';
import {idUser, userLogin,userSignup} from '../controllers/userLoginSignup.js';
import {showUnnivFacId} from '../controllers/userLoginSignup.js';

const router = express.Router();

router.post('/signup',userSignup);
router.post('/login',userLogin);
router.post('/id',idUser)
router.post('/idUnnivFac',showUnnivFacId)


export default router;