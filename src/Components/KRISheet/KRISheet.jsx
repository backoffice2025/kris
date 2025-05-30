import { useState, useEffect } from 'react';
import { getAuth, signOut } from "firebase/auth";
import { fetchDepartmentItems, submitKRI } from './api';
import { mockItemsDatabase } from './mockData';
import ItemRow from './ItemRow';
import PrintView from './PrintView';
import "./KRISheet.css"

const KRISheet = () => {
  const [department, setDepartment] = useState('Chinese');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([{ name: '', balance: '', required: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setError("You must be signed in to submit KRI.");
      setIsLoading(false);
      return;
    }

    try {
      await submitKRI({ department, date, items });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setItems([{ name: '', balance: '', required: '' }]);
    setSubmitted(false);
    setError(null);
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth).catch((err) => console.error("Logout error:", err));
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return (
    <div className="kri-container">
      <h1>Kitchen Requirement (KRI)</h1>
      {error && <div className="error-message">{error}</div>}
      
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department:</label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
              {Object.keys(mockItemsDatabase).map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
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
            <button type="button" onClick={handleLogout} className="add-btn" disabled={isLoading}>
              Logout
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
          onLogout={handleLogout}  
        />
      )}
    </div>
  );
};

export default KRISheet;
