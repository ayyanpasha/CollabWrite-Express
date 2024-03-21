const jwt = require('jsonwebtoken');
require('dotenv').config();

const fetchUser = (req, res, next) => {
    // Get the user from the JWT Token and add id to obj
    const token = req.header('auth-token');
    if (!token || token === null) {
        return res.status(401).send({ errors: "Please login in" });
    }
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ errors: "Not Authourized" });
    }
}

module.exports = fetchUser;
