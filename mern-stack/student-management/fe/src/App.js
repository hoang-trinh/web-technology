import { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AddStudent from './AddStudent';
import EditStudent from './EditStudent';

const API = 'http://localhost:5000/api/students';

function Home() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    axios.get(API).then(r => setStudents(r.data)).catch(console.error);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa?')) return;
    await axios.delete(`${API}/${id}`);
    setStudents(prev => prev.filter(s => s._id !== id));
  };

  // filter + sort
  const filtered = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const sorted = [...filtered].sort((a,b) => {
    const an = a.name.toLowerCase(), bn = b.name.toLowerCase();
    return sortAsc ? an.localeCompare(bn) : bn.localeCompare(an);
  });

  return (
    <div>
      <h1>Danh sách học sinh</h1>
      <Link to="/add">Thêm học sinh</Link>
      <div>
        <input placeholder="Tìm kiếm theo tên..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
        <button onClick={()=>setSortAsc(prev=>!prev)}>Sắp xếp: {sortAsc ? 'A→Z' : 'Z→A'}</button>
      </div>

      {sorted.length === 0 ? <p>Chưa có học sinh nào</p> :
      <table>
        <thead><tr><th>Họ tên</th><th>Tuổi</th><th>Lớp</th><th>Hành động</th></tr></thead>
        <tbody>
          {sorted.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td><td>{s.age}</td><td>{s.class}</td>
              <td>
                <Link to={`/edit/${s._id}`}>Sửa</Link>
                <button onClick={()=>handleDelete(s._id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
}

export default function App(){
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<AddStudent />} />
        <Route path="/edit/:id" element={<EditStudent />} />
      </Routes>
    </Router>
  );
}
