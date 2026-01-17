const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { getNotes, createNote, deleteNote,updateNote } = require("../controllers/noteController");
const { updateMany } = require("../models/Note");

router.use(auth);
router.get("/", getNotes);
router.post("/", createNote);
router.delete("/:id", deleteNote);
router.put("/:id", updateNote); // Temporary placeholder for updateNote

module.exports = router;
