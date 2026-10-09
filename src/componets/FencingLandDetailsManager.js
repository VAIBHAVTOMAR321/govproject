import React, { useState, useEffect } from 'react';

const API_BASE = 'https://mahadevaaya.com/govbillingsystem/backend/api';

const FencingLandDetailsManager = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: null,
    land_nali: '',
    area_hectare: '',
    permissible_length: '',
    pillars: '',
    created_at: '',
    updated_at: ''
  });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/fencing-land-details/`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      setRecords(result?.data || result || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isEditing = formData.id;
    const url = isEditing 
      ? `${API_BASE}/fencing-land-details/` 
      : `${API_BASE}/fencing-land-details/`;
    
    const payload = {
      ...formData,
      land_nali: String(formData.land_nali),
      area_hectare: String(formData.area_hectare),
      permissible_length: String(formData.permissible_length),
      pillars: parseInt(formData.pillars, 10) || 0
    };

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('Failed to save data');
      const result = await response.json();
      if (result?.data) {
        // Handle the response data which includes created_at and updated_at
        console.log('Saved record:', result.data);
      }
      setFormData({ id: null, land_nali: '', area_hectare: '', permissible_length: '', pillars: '', created_at: '', updated_at: '' });
      fetchRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      land_nali: item.land_nali,
      area_hectare: item.area_hectare,
      permissible_length: item.permissible_length,
      pillars: item.pillars,
      created_at: item.created_at,
      updated_at: item.updated_at
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const response = await fetch(`${API_BASE}/fencing-land-details/${id}/`, { method: 'DELETE' });
      if (!response.ok && response.status !== 204) throw new Error('Failed to delete');
      fetchRecords();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <input type="hidden" name="id" value={formData.id || ''} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Land Nali</label>
          <input type="text" name="land_nali" value={formData.land_nali} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Area Hectare</label>
          <input type="text" name="area_hectare" value={formData.area_hectare} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Permissible Length</label>
          <input type="text" name="permissible_length" value={formData.permissible_length} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Pillars</label>
          <input type="number" name="pillars" value={formData.pillars} onChange={handleChange} required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <button type="submit" style={{ padding: '8px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {formData.id ? 'Update' : 'Add'}
          </button>
          {formData.id && (
            <button type="button" onClick={() => setFormData({ id: null, land_nali: '', area_hectare: '', permissible_length: '', pillars: '', created_at: '', updated_at: '' })} style={{ padding: '8px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {loading ? (
        <div>Loading data...</div>
      ) : (
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f1f1f1' }}>ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f1f1f1' }}>Land Nali</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f1f1f1' }}>Area Hectare</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f1f1f1' }}>Permissible Length</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f1f1f1' }}>Pillars</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', background: '#f1f1f1' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
            ) : (
              records.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.id}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.land_nali}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.area_hectare}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.permissible_length}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.pillars}</td>
                  <td style={{ padding: '10px', border: '1px solid #ddd', display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleEdit(item)} style={{ padding: '5px 10px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FencingLandDetailsManager;