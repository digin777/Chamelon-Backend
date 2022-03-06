const express = require("express");
const signup = require("../../models/signup");
const Validator = require("../middlewares/Validaion.middleware");
const {
  isLogged,
  hasToken,
  protectedRoute,
} = require("../middlewares/Verification.middleware");
const Verification = require("../../models/verification");
const jose = require("jose");
const UserRouter = express.Router();
const dotenv = require("dotenv");
const Crypto = require("crypto");
const { publicKey, privateKey, symetric } = require("../../lib/keys");
const user = require("../../models/user");
dotenv.config();
const db = require('../db/db');
const roles = require("../../models/roles");
UserRouter.post("/register", Validator("register"), async (req, res) => {
  const { email, password } = req.body;
  try {
    const SignUp = new signup({ email, password });
    await SignUp.save(async function (err, signup) {
      if (err) {
        if (err.name === "MongoServerError" && err.code === 11000) {
          return res.json({ sucess: false, message: "User already exist!" });
        }
      }
      const OTP = Math.floor(100000 + Math.random() * 900000);
      const verify = new Verification({ sign_id: signup, otp: OTP });
      await verify.save(function (err, verifcte) {
        if (err)
          return res.json({ sucess: false, message: "Unable to create OTP" });
        return res.json({
          sucess: true,
          message: "User created sucessfully otp sented",
        });
      });
    });
  } catch (err) {
    return res
      .status(422)
      .send({ succes: false, message: "User already exist!" });
  }
});

UserRouter.post("/createUser", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    //const session = await db.startSession();
    const SignUp = new signup({ email, password })
    await SignUp.save(async function (err, signup) {
      if (err) {
        if (err.name === "MongoServerError" && err.code === 11000) {
          return res.json({ sucess: false, message: "User already exist!" });
        }
      }
      const User = new user({ signup_id: signup, name: name });
      await User.save(async function (err, user) {
        if (err) {
          return res.json({ sucess: false, message: "Canot Create User" });
        }
        return res.json({ sucess: true, message: "User Created Sucessfully" });

      });
    });
  } catch (err) {
    return res
      .status(422)
      .send({ succes: false, message: "User already exist!" });
  }
});

UserRouter.post("/login", Validator("login"), async (req, res) => {
  const { email, password } = req.body;
  try {
    signup.findOne({ email }, function (err, signup) {
      if (err) return res.json({ sucess: false, message: err.message });
      signup.comparePassword(password.toString(), async function (err, isMatch) {
        if (isMatch && !err) {
          const User = await user.findOne({ signup_id: signup });
          const buffer = await Crypto.randomBytes(48);
          const jwtId = await buffer.toString("base64");
          const symetricKey = await jose.importPKCS8(symetric, "EdDSA");
          const jwt = await new jose.SignJWT({ userId: User._id })
            .setProtectedHeader({ alg: "ES256", enc: "A256GCM" })
            .setIssuedAt()
            .setIssuer("urn:monco:issuer")
            .setAudience("urn:monco:audience")
            .setExpirationTime("1d")
            .setJti(jwtId)
            .sign(symetricKey);
          User.is_logged_in = signup.is_logged_in = true;
          await Promise.all([User.save(), signup.save()])
          return res.json({
            sucess: true,
            message: { token: jwt, islogged: true },
          });
        }
        console.log(isMatch);
      });
    });
  } catch (err) {
    return res.status(422).send({ succes: false, message: "User Login faild" });
  }
});

UserRouter.post("/createRole", Validator('createrole'), protectedRoute, async (req, res) => {
  const { name } = req.body;
  try {
    const role = new roles({ name: name });
    await role.save(async (err, role) => {
      if (err) {
        return res.status(422).send({ succes: false, message: "Canot create role" });
      }
      return res
        .status(200)
        .send({
          succes: true,
          message: "Role is Sucessfully Created",
        });
    })
  } catch (error) {
    return res.status(422).send({ succes: false, message: "Canot create role" });
  }
});

UserRouter.get("/logout", protectedRoute, async (req, res) => {
  try {
    const { jti } = req.tokenInfo;
    //moncocache.set(jti, jti, 86400);
    console.log(jti)
    memcached.set(jti, jti, 86400, function (err) {
      if(err){
        throw new Error("Unable to logout")
      }
    });
    return res
      .status(200)
      .send({
        succes: true,
        message: "Sucessfully logouted"
      });
  } catch (error) {

    return res
      .status(200)
      .send({
        succes: false,
        message: error.message
      });
  }

});

UserRouter.get("/protected", protectedRoute, async (req, res) => {
  return res
    .status(200)
    .send({
      succes: true,
      message: "You sucessfully authenticate to acess this route",
    });
});

module.exports = UserRouter;
