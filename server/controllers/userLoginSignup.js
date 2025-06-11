import {insertUser , findUser,findFaculte, findUnniversite,findUs,findfind} from '../models/userLoginSignup.js';
import bcrypt from 'bcrypt';
import {vacateurAcc} from '../models/vacateurModel.js'
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const userSignup = async (req, res) => {
    try {
        const { nomUnniversite, nomFaculte, emailUser, mdpUser, confirmePassword } = req.body;
        const userExist = await findUs(emailUser);
        
        if (userExist) {
            return res.status(400).json({ message: "User already exists" });
        }

        if (mdpUser !== confirmePassword) {
            return res.status(400).json({ message: "Passwords do not match" })
        }

        const unniv = await findUnniversite(nomUnniversite);
        if (!unniv) {
            return res.status(404).json({ message: "Université not found" });
        }

        const fac = await findFaculte(nomFaculte);
        if (!fac) {
            return res.status(404).json({ message: "Faculté not found" });
        }

        const hashPassword = await bcrypt.hash(mdpUser, 10);
        const token = jwt.sign({emailUser : emailUser},process.env.JWT_SECRET,{expiresIn  : process.env.JWT_EXPIRES_IN})

        const idUnniversite = unniv.idUnniversité;

        await insertUser(idUnniversite, fac.idFaculté, emailUser, hashPassword);
        res.status(201).json({ message: `User added successfully ${token}` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
};



export const userLogin = async (req, res) => {
  try {
    const { emailUser, mdpUser } = req.body;

    const user = await findUser(emailUser);
    

    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'user not found' });
    }

    const match = await bcrypt.compare(mdpUser, user[0].Password);
    if (!match) {
      return res.status(401).json({ message: 'wrong password' });
    }

    const id = user[0].users_id;
    const diriction = await vacateurAcc(id);
    

    if (!diriction || diriction.length === 0) {
      return res.status(404).json({
        status: "error",
        msg: "demande not found"
      });
    }

    const hasEtat1 = diriction.some(item => item.Etat === 1);

    
    const role = hasEtat1 ? 'accepted' : 'pending';

    
    const token = jwt.sign(
      {
        emailUser: emailUser,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'logged in',
      token: token,
      users_id: user[0].users_id,
      userType: user[0].userType,
      idUnniversite: user[0].idUnniversite,
      idFaculte: user[0].idFaculte,
      status: user[0].status,
      Email: user[0].Email,
      redirectionPath: hasEtat1 ? '/DashbordEns' : '/auth/pending'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const idUser = async (req,res) => {
    try{
        const { email } = req.body;
        const user = await findUser(email);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        const id = user[0].users_id;
        res.json(id);
    }catch(error){
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}


export const showUnnivFacId = async (req,res) => {
    try{
        const { email } = req.body;
        const user = await findfind(email);
        if(!user){
            return res.status(404).json({ message: 'user not found' });
        }
        
        return res.send(user);
    }catch(error){
        console.error(error)
        res.status(500).json({ message: "Internal server error" })
    }
}