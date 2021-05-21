const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new mongoose.Schema({
    firstname: {
        type: String,
        require: true
    },

    lastname: {
        type: String,
        require: true
    },

    email: {
        type: String,
        require: true,
        unique: true
    },

    password: {
        type: String,
        require: true
    },

    confirm: {
        type: String,
        require: true
    },

    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
});

// generating token

employeeSchema.methods.generateAuthToken = async function() {
    try {
        const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        res.send("The error part" + err);
    }
}

// hashing password
employeeSchema.pre("save", async function(next) {

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.confirm = await bcrypt.hash(this.password, 10);
    }

    next();
});

// creating collection

const Register = new mongoose.model("Register", employeeSchema);

module.exports = Register;