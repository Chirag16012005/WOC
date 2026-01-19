import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000/notes";

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchNotes();
  }, [token, navigate]);

  const authConfig = {
    headers: { Authorization: token },
  };

  const fetchNotes = async () => {
    const res = await axios.get(API_URL, authConfig);
    setNotes(res.data);
  };
  const addNote = async () => {
    if (!title || !content || editingId) return;

    await axios.post(API_URL, { title, content }, authConfig);
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const beginEdit = (note) => {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const updateNote = async () => {
    if (!editingId || !title || !content) return;

    await axios.put(`${API_URL}/${editingId}`, { title, content }, authConfig);
    setEditingId(null);
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await axios.delete(`${API_URL}/${id}`, authConfig);
    fetchNotes();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notes App</h2>

      <input
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <br /><br />

      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <br /><br />

      <button onClick={addNote}>Add Note</button>
      <button onClick={updateNote} disabled={!editingId}>Update Note</button>

      <hr />

      {notes.map(note => (
        <div key={note._id} style={{ marginBottom: "10px" }}>
          <h4>{note.title}</h4>
          <p>{note.content}</p>
          <button onClick={() => beginEdit(note)}>Edit</button>
          <button onClick={() => deleteNote(note._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default Notes;
