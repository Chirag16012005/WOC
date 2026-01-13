const express = require("express");
const cors=require("cors");
const app=express();
const notesRouter=require("./routers/notes");
const PORT=8008;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/notes", notesRouter);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
