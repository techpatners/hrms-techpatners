const express = require("express");
const router = express.Router();
const { auth, adminOnly } = require("../middlewares/authMiddleware");
const adminCtrl = require("../controllers/adminController");

router.use(auth, adminOnly);

router.get("/interns", adminCtrl.listInterns);
router.post("/interns", adminCtrl.createIntern);
router.delete("/interns/:id", adminCtrl.deleteIntern);

module.exports = router;
