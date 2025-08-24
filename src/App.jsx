import React, {useEffect, useState } from 'react'
import api from './api';
import { ToastContainer, toast, Bounce } from 'react-toastify';

export default function App() {
  const initialState = {title:"", description:"", completed: false};
  const[items, setItems] = useState([]);
  const [form,setForm] = useState(initialState);
  const [editingID, setEditingID] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchItems = async () => {
    try{
      setLoading(true);
      const res = await api.get('/items/');
      setItems(res.data)
    } catch (err) {
      console.error(err);
      setMessage("Failed to load items.");
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchItems()
  },[])

  const handleChange = (e) =>{
  const {name, value, type, checked} = e.target;
  setForm((f) => ({...f, [name]: type === "checkbox" ? checked : value}))
  }

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try{
      if(editingID) {
        await api.put(`/items/${editingID}/`,form);
        toast.success("Item Updated.")
      } else{
        await api.post("/items/", form);
        toast.success("Item created.")
      }
      setForm(initialState);
      setEditingID(null);
      fetchItems()
    } catch (err){
      console.error(err);
      toast.error("Save Failed.")
    }
  }

  const handleEdit = (item) =>{
    setEditingID(item.id);
    setForm({
      title:item.title,
      description:item.description,
      completed:item.completed,
    })
    window.scrollTo({top:0, behavior: "smooth"})
  }

  const handleDelete = async (id)=>{
    if (!confirm("Delete this Item")) return;
    try{
      await api.delete(`/items/${id}/`);
      setMessage("Item Deleted");
      setItems((prev)=> prev.filter((i)=> i.id !== id));
    } catch (err) {
      console.error(err);
      setMessage("Delete Failed.")
    }
  }

  const cancelEdit = () =>{
    setEditingID(null);
    setForm(initialState);
  }


  return (
    <div className='container border border-1 py-2 px-4 mx-auto'>
         <ToastContainer
         position="top-right"
autoClose={3000}
hideProgressBar={false}
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="dark"
transition={Bounce} 
/>
      <h1 className='text-center'>React + Django CRUD</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="text" name='title' className="form-control my-2" placeholder='Enter Item Title' value={form.title} onChange={handleChange} />
        </div>
        <div>
          <textarea type="text" name='description' className="form-control my-2" rows={3} placeholder='Enter Item Description' value={form.description} onChange={handleChange} />
        </div>
        <div className='my-2'>
          <label>
          <input type="checkbox" className='form-check-input mx-2' name='completed' checked={form.completed} onChange={handleChange} />
          Completed
          </label>
        </div>
        <div className="my-2">
          <button type='submit' className='btn btn-primary'>
            {editingID ? "Update" : "Create"}
          </button>
          {editingID && (
            <button type='button' className='btn btn-warning' onClick={cancelEdit}>Cancel</button>
          )}
        </div>


        {message && <div className='text-primary'>{message}</div>}

      </form>

      {/* list */}

      <div className="container mt-4">
        <h2 className="text-center">Items</h2>
        <button onClick={fetchItems} disabled={loading} className='btn btn-warning'>{loading ? "Refreshing" : "Refresh"}</button>
      </div>

      {items.length === 0 && !loading && <p>No Items yet.</p>}

      <table className='table table-striped'>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item)=>(
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.description}</td>
              <td>{item.completed ? "Yes" : "No"}</td>
              <td>
                <button className="btn btn-secondary mx-2" onClick={()=>handleEdit(item)}>Edit</button>
                <button className="btn btn-danger" onClick={()=>handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  )
}
