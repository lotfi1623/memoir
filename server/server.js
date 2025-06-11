import express from 'express';
import userLoginSignup from './routers/userLoginSignup.js';
import vacateurRouters from './routers/vacateurRouters.js';
import chefRouters from './routers/chefRouters.js';
import enseignantRouters from './routers/enseignantRouters.js';
import adminRouters from './routers/adminRouters.js';
import releverRouters from './routers/releverRouters.js'
import cors from 'cors';
import 'dotenv/config';



const server = express();

server.use(express.json());
server.use(cors());



server.use('/user',userLoginSignup);
server.use('/vacateur', vacateurRouters);
server.use('/chefdepartement', chefRouters);
server.use('/enseignant',enseignantRouters);
server.use('/admin',adminRouters);
server.use('/relever',releverRouters);

const port = process.env.PORT || 4000
 

server.listen(port , () => {
    console.log(`server is running in ${port}`)
})

