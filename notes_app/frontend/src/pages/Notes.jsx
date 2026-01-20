import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Notes.css";

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  return (
    <div className="notes-container">
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>

      <div className="notes-header">
        <h2>My Notes</h2>
        <p className="notes-count">
          You have {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </p>
      </div>
      <div className="note-form">
        <div className="form-group">
          <input
            placeholder="Enter note title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <textarea
            placeholder="Write your note content here..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div className="form-actions">
          {editingId && (
            <button onClick={cancelEdit} className="btn btn-secondary">
              Cancel
            </button>
          )}
          {editingId ? (
            <button onClick={updateNote} disabled={!editingId || !title || !content} className="btn btn-secondary">
              Update Note
            </button>
          ) : (
            <button onClick={addNote} disabled={!title || !content} className="btn btn-primary">
              Add Note
            </button>
          )}
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <h3>No notes yet!</h3>
          <p>Create your first note above to get started.</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map(note => (
            <div key={note._id} className="note-card">
              <h4>{note.title}</h4>
              <p>{note.content}</p>
              <div className="note-actions">
                <button onClick={() => beginEdit(note)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => deleteNote(note._id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notes;
