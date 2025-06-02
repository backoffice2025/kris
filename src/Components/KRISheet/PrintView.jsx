import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "./KRISheet.css"

const PrintView = ({ department, date, items, onReset, onLogout }) => {
  const printRef = useRef();

  // Filter: only show items where required qty is not 0/empty
  const filteredItems = items.filter(item => {
    const req = (item.required ?? '').toString().trim();
    return req !== '' && req !== '0' && req !== '0.0' && req !== '0.00';
  });

  const handlePrint = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${department}_KRI_${date.replace(/\//g, '-')}.pdf`);
  };

  return (
    
    <div className="print-container">
      <div className="print-view" ref={printRef}>
        <div className="print-header">
          <h2>{department} Department - KRI Sheet</h2>
          <p>Date: {date}</p>
        </div>
        
{filteredItems.length > 0 ? (
  <div className="kri-table-container">
    <table className="kri-table">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Balance</th>
          <th>Required Qty</th>
        </tr>
      </thead>
      <tbody>
        {filteredItems.map((item, index) => (
          <tr key={index}>
            <td>{item.name || '-'}</td>
            <td>
              {item.balance || '0'} 
              {item.balance && item.balanceUnit && ` ${item.balanceUnit}`}
            </td>
            <td>
              {item.required || '0'}
              {item.required && item.requiredUnit && ` ${item.requiredUnit}`}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
) : (
  <div className="empty-message">
    No items with required quantity found.
  </div>
)}

      </div>
      
      <div className="print-actions">
        <button onClick={handlePrint} className="print-btn" disabled={filteredItems.length === 0}>
          Print KRI
        </button>
        <button onClick={onReset} className="reset-btn">
          Create New KRI
        </button>
      </div>
    </div>
  );
};

export default PrintView;
