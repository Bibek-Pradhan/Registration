const jwt = require("jsonwebtoken");
const Register = require("../models/registers");

const auth = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const verfiyUser = jwt.verify(token, process.env.SECRET_KEY);

        // to get details of user
        const user = await Register.findOne({ _id: verfiyUser._id })

        next();

    } catch (error) {
        res.redirect("/login")
    }
}

module.exports = auth;