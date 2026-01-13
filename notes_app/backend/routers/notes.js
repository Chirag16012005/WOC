const express=require("express");
const router=express.Router();

let notes=[
  {
    id: 1,
    title: "Express Basics",
    content: "Learn routes and middleware."
  }
];
router.get("/", (req, res) => {
  res.json(notes);
});

router.post("/", (req, res) => 
{
  const { title, content } = req.body;

  if (!title || !content) 
    return res.status(400).json({ message: "Title and content required" });


  const newNote = 
  {
    id: Date.now(),
    title,
    content
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

router.put("/:id", (req, res) => 
{
  const id = Number(req.params.id);
  const {title,content}=req.body;

  const note = notes.find(n => n.id===id);

  if (!note) 
{
    return res.status(404).json({ message: "Note not found" });
  }

  note.title = title || note.title;
  note.content = content || note.content;

  res.json(note);
});

router.delete("/:id", (req, res) => 
{
  const id = Number(req.params.id);
  const initialLength = notes.length;

  notes = notes.filter(n => n.id !== id);

  if(notes.length===initialLength) 
  {
    return res.status(404).json({message: "Note not found" });
  }

  res.json({ message: "Note deleted" });
});

module.exports = router;