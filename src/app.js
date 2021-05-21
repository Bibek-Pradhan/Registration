require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

require("./db/connect");
const Register = require("./models/registers");

const port = process.env.PORT || 8000;

const static_path = path.join(__dirname, "../public");
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

//app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/register", (req, res) => {
    res.render("register");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/blog", auth, (req, res) => {
    res.render("blog");
});


app.get("*", (req, res) => {
    res.render("error");
});

// create a new user in database
app.post("/register", async(req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirm;

        if (password === cpassword) {
            const registerPeople = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: password,
                confirm: cpassword
            });

            const token = await registerPeople.generateAuthToken();

            // cookies 
            res.cookie("jwt", token, {
                // expires: new Date(Date.now() + 50000),
                // httpOnly: true
            });

            const register = await registerPeople.save();

            res.status(201).redirect("/login");

        } else {
            res.send("Password don't match.")
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

// login validation

app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();

        res.cookie("jwt", token, {
            // expires: new Date(Date.now() + 50000),
            // httpOnly: true
        });

        if (isMatch) {
            res.status(201).redirect("/blog");
        } else {
            res.send("Invalid login operation.");
        }

    } catch (error) {
        res.status(400).send("Invalid login operation.");
    }
})

app.listen(port, () => {
    console.log(`Server running at ${port}`);
});