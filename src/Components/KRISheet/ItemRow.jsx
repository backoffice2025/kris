import React from 'react';

const ItemRow = ({ item, index, onChange, onRemove, disabled }) => (
  <div className="item-row">
    <input
      type="text"
      placeholder="Item name"
      value={item.name}
      onChange={(e) => onChange(index, 'name', e.target.value)}
      required
    />
    
    <div className="input-with-unit">
      <input
        type="number"
        placeholder="Balance"
        value={item.balance}
        onChange={(e) => onChange(index, 'balance', e.target.value)}
        min="0"
        required
      />
      <select
        value={item.balanceUnit || 'unit'}
        onChange={(e) => onChange(index, 'balanceUnit', e.target.value)}
        className="unit-selector"
      >
        <option value="kg">kg</option>
        <option value="gm">gm</option>
        <option value="unit">ltr</option>
        <option value="bottle">bottle</option>
      </select>
    </div>
    
    <div className="input-with-unit">
      <input
        type="number"
        placeholder="Required Qty"
        value={item.required}
        onChange={(e) => onChange(index, 'required', e.target.value)}
        min="0"
        required
      />
      <select
        value={item.requiredUnit || 'unit'}
        onChange={(e) => onChange(index, 'requiredUnit', e.target.value)}
        className="unit-selector"
      >
        <option value="kg">kg</option>
        <option value="gm">gm</option>
        <option value="unit">ltr</option>
        <option value="bottle">bottle</option>
      </select>
    </div>
    
    <button 
      type="button" 
      onClick={() => onRemove(index)}
      className="remove-btn"
      disabled={disabled}
    >
      Remove
    </button>
  </div>
);

export default ItemRow;