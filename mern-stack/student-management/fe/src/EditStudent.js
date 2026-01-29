import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
const API = 'http://localhost:5000/api/students';

export default function EditStudent(){
  const { id } = useParams();
  const nav = useNavigate();
  const [name,setName]=useState(''); const [age,setAge]=useState(''); const [stuClass,setStuClass]=useState('');

  useEffect(()=>{
    axios.get(`${API}/${id}`).then(r=>{
      setName(r.data.name); setAge(r.data.age); setStuClass(r.data.class);
    }).catch(console.error);
  },[id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`${API}/${id}`, { name, age: Number(age), class: stuClass });
    nav('/');
  };

  return (
    <form onSubmit={handleUpdate}>
      <h2>Sửa học sinh</h2>
      <input value={name} onChange={e=>setName(e.target.value)} required />
      <input value={age} onChange={e=>setAge(e.target.value)} type="number" required />
      <input value={stuClass} onChange={e=>setStuClass(e.target.value)} required />
      <button type="submit">Lưu</button>
    </form>
  );
}
