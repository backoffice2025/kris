import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './EditRequirement.css';

const EditItem = () => {
  const { id, index } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [item, setItem] = useState({
    name: '',
    balance: '',
    balanceUnit: 'units',
    required: '',
    requiredUnit: 'units',
    ...location.state?.item
  });
  const [department, setDepartment] = useState(location.state?.department || '');
  const [date, setDate] = useState(location.state?.date || '');
  const [loading, setLoading] = useState(!location.state?.item);
  const [error, setError] = useState(null);
  const itemIndex = parseInt(index); // Ensure index is a number

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
            
            // Safely get the item at index
            if (data.items && data.items.length > itemIndex) {
              setItem({
                name: data.items[itemIndex].name || '',
                balance: data.items[itemIndex].balance || '',
                balanceUnit: data.items[itemIndex].balanceUnit || 'units',
                required: data.items[itemIndex].required || '',
                requiredUnit: data.items[itemIndex].requiredUnit || 'units'
              });
            } else {
              setError("Item index out of bounds");
            }
          } else {
            setError("Document not found");
          }
        } catch (err) {
          console.error("Fetch error:", err);
          setError("Failed to fetch requirement");
        } finally {
          setLoading(false);
        }
      };

      fetchRequirement();
    }
  }, [id, itemIndex, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prev => ({
      ...prev,
      [name]: name === 'balance' || name === 'required' ? 
        (value === '' ? '' : Number(value)) : // Convert to number or keep empty string
        value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, "KRI_Submissions", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Validate items array exists and index is valid
        if (!data.items || data.items.length <= itemIndex) {
          throw new Error("Invalid item index");
        }

        const updatedItems = [...data.items];
        updatedItems[itemIndex] = item;

        await updateDoc(docRef, {
          items: updatedItems,
          lastUpdated: new Date().toISOString(),
        });

        navigate(`/view-requirement/${id}`, {
          state: { message: 'Item updated successfully' },
          replace: true
        });
      } else {
        throw new Error("Document not found");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!item) return <div className="not-found">Item not found</div>;

  return (
    <div className="edit-item">
      <h1>Edit Item</h1>

      <div className="requirement-info">
        <p><strong>Department:</strong> {department}</p>
        <p><strong>Date:</strong> {date ? new Date(date).toLocaleDateString() : 'N/A'}</p>
      </div>

      <form onSubmit={handleSubmit} className="item-form">
        <div className="form-group">
          <label htmlFor="name">Item Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={item.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Balance:</label>
          <div className="input-row">
            <input
              type="number"
              name="balance"
              value={item.balance}
              onChange={handleChange}
              required
              min="0"
              step="any"
              disabled={loading}
            />
            <select
              name="balanceUnit"
              value={item.balanceUnit}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="units">units</option>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Requirement:</label>
          <div className="input-row">
            <input
              type="number"
              name="required"
              value={item.required}
              onChange={handleChange}
              required
              min="0"
              step="any"
              disabled={loading}
            />
            <select
              name="requiredUnit"
              value={item.requiredUnit}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="units">units</option>
              <option value="kg">kg</option>
              <option value="liters">liters</option>
              <option value="pieces">pieces</option>
            </select>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button 
            type="submit" 
            className="update-btn"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Item'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/view-requirement/${id}`)}
            className="cancel-btn"
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditItem;
