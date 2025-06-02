import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const ADMIN_EMAIL = "admin@kris.com";

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [kriData, setKriData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterApproval, setFilterApproval] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser?.email === ADMIN_EMAIL) {
        try {
          const q = query(collection(db, "KRI_Submissions"), orderBy('date', 'desc'));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setKriData(data);
        } catch (err) {
          setError("Failed to fetch data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleApproval = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "KRI_Submissions", id), { 
        approved: !currentStatus,
        approvedAt: new Date().toISOString()
      });
      setKriData(prev =>
        prev.map(entry =>
          entry.id === id ? { ...entry, approved: !currentStatus } : entry
        )
      );
    } catch (err) {
      console.error("Error updating approval:", err);
      setError("Failed to update approval status");
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to logout");
    }
  };

  const handleViewRequirement = (id) => {
    navigate(`/view-requirement/${id}`);
  };

  const filteredData = kriData.filter(entry => {
    const matchesSearch = 
      entry.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.items.some(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesDepartment = 
      filterDepartment === 'all' || entry.department === filterDepartment;
    
    const matchesApproval = 
      filterApproval === 'all' || 
      (filterApproval === 'approved' && entry.approved) ||
      (filterApproval === 'pending' && !entry.approved);
    
    return matchesSearch && matchesDepartment && matchesApproval;
  });

  const departments = ['all', ...new Set(kriData.map(entry => entry.department))];

  if (loading) return <div className="loading">Loading...</div>;
  if (!user || user.email !== ADMIN_EMAIL) return <div className="access-denied">Access denied. Admins only.</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            placeholder="Search by department, user, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Department:</label>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            {departments.map(dept => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Approval Status:</label>
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value)}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="stats-summary">
        <div className="stat-card">
          <h3>Total Submissions</h3>
          <p>{kriData.length}</p>
        </div>
        <div className="stat-card">
          <h3>Approved</h3>
          <p>{kriData.filter(entry => entry.approved).length}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p>{kriData.filter(entry => !entry.approved).length}</p>
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Department</th>
              <th>Submitted By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map(entry => (
                <tr key={entry.id} className={entry.approved ? 'approved' : 'pending'}>
                  <td>{new Date(entry.date).toLocaleDateString()}</td>
                  <td>{entry.department}</td>
                  <td>{entry.submittedBy || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${entry.approved ? 'approved' : 'pending'}`}>
                      {entry.approved ? 'Approved' : 'Pending'}
                    </span>
                    {entry.approved && entry.approvedAt && (
                      <div className="approval-time">
                        {new Date(entry.approvedAt).toLocaleString()}
                      </div>
                    )}
                  </td>
              
<td>
  <div className="action-buttons">
    <button
      onClick={() => handleViewRequirement(entry.id)}
      className="action-btn view"
    >
      View
    </button>
    <button
      onClick={() => handleApproval(entry.id, entry.approved || false)}
      className={`action-btn ${entry.approved ? 'unapprove' : 'approve'}`}
    >
      {entry.approved ? 'Unapprove' : 'Approve'}
    </button>
  </div>
</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-results">No matching records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
