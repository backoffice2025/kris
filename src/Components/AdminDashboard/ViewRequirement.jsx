import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './ViewRequirement.css';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ViewRequirement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const docRef = doc(db, "KRI_Submissions", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setRequirement({
            ...data,
            date: data.date || new Date().toISOString(),
            items: data.items || []
          });
        } else {
          setError("Requirement not found");
        }
      } catch (err) {
        setError("Failed to load requirement");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirement();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      const element = pdfRef.current;
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
      pdf.save(`${requirement.department}_KRI_${requirement.date.replace(/\//g, '-')}.pdf`);
    } catch (err) {
      setError("Failed to generate PDF");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditItem = (itemIndex) => {
    navigate(`/edit-item/${id}/${itemIndex}`, {
      state: {
        item: requirement.items[itemIndex],
        department: requirement.department,
        date: requirement.date
      }
    });
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!requirement) return <div className="not-found">Requirement not found</div>;

  return (
    <div className="view-requirement">
      <div className="view-header">
        <h1>{requirement.department} Department Requirement</h1>
        <div className="view-actions">
         <button onClick={() => navigate('/admin')} className="back-btn">
  Back to Dashboard
</button>
          <button onClick={handleDownloadPDF} className="print-btn">
            Download as PDF
          </button>
        </div>
      </div>
      
      <div ref={pdfRef} className="view-content">
        <div className="requirement-meta">
          <div className="meta-row">
            <span className="meta-label">Date:</span>
            <span className="meta-value">
              {new Date(requirement.date).toLocaleDateString()}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Submitted By:</span>
            <span className="meta-value">
              {requirement.submittedBy || 'Not specified'}
            </span>
          </div>
          <div className="meta-row">
            <span className="meta-label">Status:</span>
            <span className={`status-badge ${requirement.approved ? 'approved' : 'pending'}`}>
              {requirement.approved ? 'Approved' : 'Pending Approval'}
              {requirement.approvedAt && (
                <span className="approval-time">
                  on {new Date(requirement.approvedAt).toLocaleString()}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="items-section">
          <h2>Items List</h2>
          <div className="items-table-wrapper">
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Current Balance</th>
                <th>Required Quantity</th>
                <th>Issued</th>
                <th>Remark</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirement.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.balance} {item.balanceUnit || 'units'}</td>
                  <td>{item.required} {item.requiredUnit || 'units'}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.fulfilled || false}
                      onChange={() => {
                        const updatedItems = [...requirement.items];
                        updatedItems[index].fulfilled = !updatedItems[index].fulfilled;
                        setRequirement({ ...requirement, items: updatedItems });
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="Add remark"
                      value={item.remark || ''}
                      onChange={(e) => {
                        const updatedItems = [...requirement.items];
                        updatedItems[index].remark = e.target.value;
                        setRequirement({ ...requirement, items: updatedItems });
                      }}
                    />
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditItem(index)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRequirement;