import express from 'express'
import service from '../Service/Services.js';

const route = express.Router();
route.use("/signup", service.SignUp);
route.use("/signin", service.SignIn);

export default route;