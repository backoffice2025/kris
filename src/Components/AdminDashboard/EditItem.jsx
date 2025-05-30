import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './EditRequirement.css';

const EditItem = () => {
  const { id, index } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [item, setItem] = useState(location.state?.item || {});
  const [department, setDepartment] = useState(location.state?.department || '');
  const [date, setDate] = useState(location.state?.date || '');
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!location.state?.item) {
      const fetchRequirement = async () => {
        try {
          const docRef = doc(db, "KRI_Submissions", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setDepartment(data.department);
            setDate(data.date);
            setItem(data.items[index]);
          } else {
            setError("Document not found");
          }
        } catch (err) {
          console.error(err);
          setError("Failed to fetch requirement");
        } finally {
          setLoading(false);
        }
      };

      fetchRequirement();
    }
  }, [id, index, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "KRI_Submissions", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedItems = [...data.items];
        updatedItems[index] = item;

        await updateDoc(docRef, {
          items: updatedItems,
          lastUpdated: new Date().toISOString(),
        });

        navigate(`/view-requirement/${id}`, {
          state: { message: 'Item updated successfully' },
        });
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update item");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div className="not-found">Item not found</div>;

  return (
    <div className="edit-item">
      <h1>Edit Item</h1>

      <div className="requirement-info">
        <p><strong>Department:</strong> {department}</p>
        <p><strong>Date:</strong> {new Date(date).toLocaleDateString()}</p>
      </div>

      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label htmlFor="name">Item Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={item.name || ''}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Current Balance:</label>
          <div className="input-row">
            <input
              type="number"
              name="balance"
              value={item.balance !== undefined ? String(item.balance) : ''}
              onChange={handleChange}
              required
            />
            <select
              name="balanceUnit"
              value={item.balanceUnit || 'units'}
              onChange={handleChange}
            >
              <option value="units">units</option>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Required Quantity:</label>
          <div className="input-row">
            <input
              type="number"
              name="required"
              value={item.required || ''}
              onChange={handleChange}
              required
            />
            <select
              name="requiredUnit"
              value={item.requiredUnit || 'units'}
              onChange={handleChange}
            >
              <option value="units">units</option>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="update-btn">Update Item</button>
          <button
            type="button"
            onClick={() => navigate(`/view-requirement/${id}`)}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
