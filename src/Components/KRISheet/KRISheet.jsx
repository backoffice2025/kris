import { useState, useEffect } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { fetchDepartmentItems, submitKRI } from './api';
import { mockItemsDatabase } from './mockData';
import ItemRow from './ItemRow';
import PrintView from './PrintView';
import "./KRISheet.css"

const KRISheet = () => {
  const [department, setDepartment] = useState(null); // Start with no department selected
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ name: '', balance: '', required: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (department) {
      const fetchItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const data = await fetchDepartmentItems(department);
          setItems(Array.isArray(data) && data.length > 0
            ? data.map(item => ({ name: item.name, balance: item.balance || '', required: '' }))
            : [{ name: '', balance: '', required: '' }]
          );
        } catch (err) {
          setError(err?.message || String(err));
        } finally {
          setIsLoading(false);
        }
      };
      fetchItems();
    }
  }, [department]);

  const handleAddItem = () => setItems([...items, { name: '', balance: '', required: '' }]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // All item fields are optional now
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in to submit KRI.");
      setIsLoading(false);
      return;
    }

    // No validation for item fields

    try {
      await submitKRI({ department, date, items });
      setSubmitted(true);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setDepartment(null);
    setItems([{ name: '', balance: '', required: '' }]);
    setSubmitted(false);
    setError(null);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).catch((err) => console.error("Logout error:", err));
  };

  if (isLoading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading {department} requirements...</p>
    </div>
  );

  // Department selection screen
  if (!department) {
    return (
      <div className="department-selection">
        <h1>Select Kitchen Department</h1>
        <div className="department-grid">
          {Object.keys(mockItemsDatabase).map(dept => (
            <div 
              key={dept} 
              className="department-card"
              onClick={() => setDepartment(dept)}
            >
              <div className="card-icon">{dept.charAt(0)}</div>
              <h3>{dept}</h3>
              <p>Click to view requirements</p>
            </div>
          ))}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="kri-container">
      <div className="department-header">
        <h1>{department} Kitchen Requirement</h1>
        <button onClick={handleReset} className="back-btn">
          ← Back to Departments
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date:</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
          
          <h3>Items:</h3>
          {items.map((item, index) => (
            <ItemRow 
              key={index}
              item={item}
              index={index}
              onChange={handleItemChange}
              onRemove={handleRemoveItem}
              disabled={isLoading}
            />
          ))}
          
          <div className="button-group">
            <button type="button" onClick={handleAddItem} className="add-btn" disabled={isLoading}>
              Add Item
            </button>
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit KRI'}
            </button>
          </div>
        </form>
      ) : (
        <PrintView 
          department={department}
          date={date}
          items={items}
          onPrint={() => window.print()}
          onReset={handleReset}
        />
      )}
    </div>
  );
};

export default KRISheet;
