import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import "./KRISheet.css"


const PrintView = ({ department, date, items, onReset, onLogout }) => {
  const printRef = useRef();

  const handlePrint = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
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
        
        <table className="kri-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Balance</th>
              <th>Required Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.balance} {item.balanceUnit || ''}</td>
                <td>{item.required} {item.requiredUnit || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="print-actions">
        <button onClick={handlePrint} className="print-btn">Print KRI</button>
        <button onClick={onReset} className="reset-btn">Create New KRI</button>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default PrintView;