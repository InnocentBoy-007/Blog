import express from 'express'
import service from '../Service/AuthServices.js';

const route = express.Router();
route.use("/signup", service.SignUp);
route.use("/signin", service.SignIn);

export default route;