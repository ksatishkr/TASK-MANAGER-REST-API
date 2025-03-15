const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const sharp = require("sharp");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const { sendWelcomeEmail, cancelationAccount } = require("../emails/account");
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});
router.post("/users/verify-password", auth, async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user; // Authenticated user from middleware
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Incorrect current password" });
    }
    res.send({ success: true, message: "Password verified successfully" });
  } catch (error) {
    res.status(500).send({ error: "Something went wrong" });
  }
});
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const isValidUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every((update) =>
    isValidUpdates.includes(update)
  );
  if (!isValidOperation)
    return res.status(400).send({ error: "Invalid updates!" });
  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(202).send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.deleteOne();
    cancelationAccount(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send("error");
  }
});
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error("Please upload an image!"));
    }
    cb(undefined, true);
  },
});
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      // .png()
      .toFormat("png") // Ensure PNG format
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send("image succesfully uploaded!");
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  }
);
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send({ message: "profile image succesfull deleted!" });
});
router.get("/users/:id/avatar", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      // throw new Error();
      return;
    }
    user.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send({ error: "Image not found!" });
  }
});
module.exports = router;
