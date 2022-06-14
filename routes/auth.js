const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var fetchuser=require('../middleware/fetchuser');
const JWT_SECRET = "vikas sharma is a stu@dent of iiitpune";
// router.get('/',(req,res)=>{

//     res.json([])
// })

// ROUTE1: create a user using POST "/api/auth/createuser". No login required
router.post(
  "/createuser",
  [
    body("name", "Enter name of minimum length 3").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Enter password with minimum length 5").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    //if there  are error, return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // check weather the user with same email exist or not
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry user with the same email already exists" });
      }

      //salt secpass help in generating a secure password with the help of bcrypt npm hash is generated for the password and instead of actual password hashcode for the password is stored in the database
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      //   .then(user => res.json(user))
      //    .catch(err=>{console.log(err)
      // res.json({error:'Please enter a unique value'})})
      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      // console.log(authtoken);
      res.json({ authtoken });
      //instead of sending user data(id password...) we send authtoken in which are data(user id,jwtsecret(our secret message) is taken and converted to token and send to teh user so that in future if someone comes with the same token we can retrieve its userid)
      // res.json({ user });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some error occured");
    }
  }
);

//ROUTE2: authenticate a user using :POST "/api/auth/login". no login required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    //if there  are error, return Bad request and the error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct Credential" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct Credential" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);
      res.json(authtoken);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

//ROUTE 3:Get logged in user details :POST "/api/auth/getuser" .Login required

router.post('/getuser',fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server error");
  }
});

module.exports = router;
