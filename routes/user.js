var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");
const User = require("../models/user");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middlewares/auth");

router.post(
  "/signup",
  [
    check("Name", "Name is required").not().isEmpty(),
    check("Email", "email must be there ").isEmail(),
    check("Password", "please enter the correct password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(req.body);
    if (!errors.isEmpty()) {
      return res.status(400).json({
          errors: errors.array(),
        });
        // return res.json({ msg: "Something went wrong" });
      }
    const { Email, Password, Name } = req.body;
    try {
      let user = await User.findOne({ Email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "user already exist" }] });
      }
      user = new User({
        Name,
        Email,
        Password
      });
      const salt = await bcrypt.genSalt(10);
      user.Password = await bcrypt.hash(Password, salt);
      await user.save();
      res.json({ msg: "user registered sucessfully" });
    } catch (err) {
      console.error(err.message);
      //res.status(400).json("server error");
      return res.json({ msg: "Something went wrong" });
    }
  }
);

router.post(
  "/signin",
  [
    check("Email", "email must be there ").isEmail(),
    check("Password", "please enter the password").isLength({ min: 8 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    if (
      !req.headers.authorization || req.headers.authorization.indexOf("Basic ") === -1) {
      return res.status(401).json({ message: "Missing Authorization Header" });
    }
    // verify auth credentials
    const base64Credentials = req.headers.authorization.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "ascii"
    );
    
    const [Email, Password] = credentials.split(":");
    try {
      let user = await User.findOne({ Email });
      if (!user) {
        return res.status(400).json({ errors: [{ msg: "invalid user" }] });
      }
      const isMatch = await bcrypt.compare(Password, user.Password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "password does'nt match" }] });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          return res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(400).json("Server error");
    }
  }
)

router.get("/signout", auth, (req, res) => {
  res.clearCookie("token");
  res.json({ msg: "user signed out sucessfully" });
});

router.get("/myprofile", auth, async (req, res) => {
  try {
    const profile = await User.findById(req.user.id);
    if (!profile) {
      res.status(500).json("no profile found");
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(400).json("Server error");
  }
});

module.exports = router;