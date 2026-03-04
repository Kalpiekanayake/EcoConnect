import { useEffect, useState } from "react";
import API from "../services/api";

function Waste() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [wastes, setWastes] = useState([]);

  // Fetch wastes
  const fetchWastes = async () => {
    try {
      const response = await API.get("/wastes");
      setWastes(response.data);
    } catch (error) {
      console.error("Error fetching wastes", error);
    }
  };

  useEffect(() => {
    fetchWastes();
  }, []);

  // Create waste
  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await API.post("/wastes", {
        title,
        description,
        category_id: Number(categoryId),
      });

      setTitle("");
      setDescription("");
      setCategoryId("");
      fetchWastes();
    } catch (error) {
      console.error("Error creating waste", error);
    }
  };

  // Delete waste
  const handleDelete = async (id) => {
    try {
      await API.delete(`/wastes/${id}`);
      fetchWastes();
    } catch (error) {
      console.error("Error deleting waste", error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>My Wastes</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br />

        <input
          type="number"
          placeholder="Category ID"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        />
        <br />

        <button type="submit">Add Waste</button>
      </form>

      <hr />

      {wastes.map((waste) => (
        <div key={waste.id} style={{ marginBottom: "10px" }}>
          <strong>{waste.title}</strong> - {waste.description}
          <button onClick={() => handleDelete(waste.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default Waste;