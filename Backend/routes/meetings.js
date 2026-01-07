const express = require("express");
const router = express.Router();
const meetingsCtrl = require("../controllers/meetingsController");
const { auth, adminOnly } = require("../middlewares/authMiddleware");

router.use(auth);

router.get("/", auth, meetingsCtrl.list);

router.post("/", auth, adminOnly, meetingsCtrl.create);

module.exports = router;
