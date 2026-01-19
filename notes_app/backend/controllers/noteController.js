    const Note = require("../models/Note");
    const mongoose = require("mongoose");

    exports.getNotes = async (req, res) => {
    const notes = await Note.find({ user: req.userId });
    res.json(notes);
    };

    exports.createNote = async (req, res) => {
    const note = await Note.create({
        ...req.body,
        user: req.userId
    });
    res.status(201).json(note);
    };

  
exports.deleteNote = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid note ID" });
  }

  const note = await Note.findOneAndDelete({
    _id: id,
    user: req.userId
  });

  if (!note) {
    return res.status(404).json({ message: "Note not found" });
  }

  res.json({ message: "Deleted" });
};

exports.updateNote = async (req, res) => {
    const {id}=req.params;
    const { title, content } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid note ID" });
    }
    const note = await Note.findOneAndUpdate(
      { _id: id, 
        user: req.userId 
      },
      { 
        title, 
        content 
      },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.json(note);
};