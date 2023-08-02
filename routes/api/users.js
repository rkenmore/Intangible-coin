const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");

// Function to add 1 to coin for every hour
function incrementCoin(coin) {
    coin += 1;
  }

// @route   POST api/users
// @desc    Register user
// @access  Public
router.post("/", async (req, res) => {
    const {
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        email,
        password
    } = req.body;
    try {
        let user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ message: "A user with this email already exists" });
        }

        user = new User({
            firstName,
            middleName,
            lastName,
            dateOfBirth,
            email,
            password
        });

        user.coinBalance = 0;

        const now = new Date();
        const birthDate = new Date(user.dateOfBirth);
        const timeDifferenceInMilliseconds = now - birthDate;

        // Calculate the number of hours lived
        const hoursLived = Math.floor(timeDifferenceInMilliseconds / (1000 * 60 * 60));

        // Add the hours lived to the coin value
        user.coinBalance += hoursLived;

        // Add 1 to coin balance every hour
        setInterval(incrementCoin(user.coinBalance), 60 * 60 * 1000);

        /*const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        console.log(user.password);*/

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get("jwtSecret"), { expiresIn: 360000 }, (err, token) => {
            if(err) throw err;
            res.json({ token, data: user });
        });

        /*res.status(200).json({
            success: true,
            data: user
        });*/
    } catch (err) {
        res.status(400).json({ message: err.message});
    }
});

module.exports = router;