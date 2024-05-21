import express, {Request,Response} from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import fetchUser from '../middleware/fetchUser';
import User from '../model/User';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

//Validation middleware for Signup
const validationSignup = [
    body('name').trim().isLength({ min: 1 }).withMessage("Name cannot be empty"),
    body('email').isEmail().withMessage("Invalid email address"),
    body('password').trim().isLength({ min: 3 }).withMessage("Password must be atleast 3 letters"),
];
// ROUTE 1: Create new User: POST-'/api/auth/signup'
router.post('/signup', validationSignup, async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.email = req.body.email.toLowerCase();
        const { name, email, password } = req.body;
        
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: "User with this email already exists" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ name, email, password: hashedPassword });

        const authToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET as Secret);
        res.status(201).json({ authToken });
    } catch (error) {
        // console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Validation middleware for login
const validateLoginUserInput = [
    body('email').isEmail().withMessage("Invalid email address"),
    body('password').trim().notEmpty().withMessage("Password cannot be blank"),
];
// ROUTE 2: Login User: POST-'/api/auth/login'
router.post('/login', validateLoginUserInput, async (req: Request, res: Response) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        req.body.email = req.body.email.toLowerCase();
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ errors: "Invalid credentials" });
        }

        const authToken = jwt.sign({ user: { id: user.id } }, process.env.JWT_SECRET as Secret);
        res.status(200).json({ authToken });
    } catch (error) {
        // console.error(error.message);
        res.status(500).json({ errors: 'Internal Server Error' });
    }
});

// ROUTE 3: Authenticate User: POST-'/api/auth/'
router.post('/', fetchUser, async (req: Request, res: Response) => {
    try {
        const userId = req.headers['userId'];

        let currentUser = await User.findOne({ _id: userId }).select("-password");
        if (!currentUser) {
            return res.status(400).json({ errors: "Invalid credentials" });
        }
        res.json(currentUser);
    } catch (error) {
        // console.error(error.message);
        res.status(500).json({ errors: 'Internal Server Error' });
    }
});

export default router;
