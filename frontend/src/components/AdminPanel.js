import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminPanel({ onUpdate }) {
  const [festivals, setFestivals] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    start_date: '',
    end_date: '',
    region: 'tirol',
    website: '',
    contact_email: '',
    contact_phone: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      const response = await axios.get(`${API_URL}/festivals`);
      setFestivals(response.data);
    } catch (error) {
      console.error('Error fetching festivals:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    const token = localStorage.getItem('token');
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/festivals/${editingId}`, formDataToSend, config);
      } else {
        await axios.post(`${API_URL}/festivals`, formDataToSend, config);
      }
      
      resetForm();
      fetchFestivals();
      onUpdate();
    } catch (error) {
      console.error('Error saving festival:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }
  };

  const handleEdit = (festival) => {
    setFormData({
      name: festival.name,
      description: festival.description || '',
      location: festival.location,
      address: festival.address || '',
      latitude: festival.latitude || '',
      longitude: festival.longitude || '',
      start_date: festival.start_date,
      end_date: festival.end_date,
      region: festival.region,
      website: festival.website || '',
      contact_email: festival.contact_email || '',
      contact_phone: festival.contact_phone || ''
    });
    setEditingId(festival.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sind Sie sicher, dass Sie dieses Festival löschen möchten?')) {
      const token = localStorage.getItem('token');
      try {
        await axios.delete(`${API_URL}/festivals/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchFestivals();
        onUpdate();
      } catch (error) {
        console.error('Error deleting festival:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      address: '',
      latitude: '',
      longitude: '',
      start_date: '',
      end_date: '',
      region: 'tirol',
      website: '',
      contact_email: '',
      contact_phone: ''
    });
    setEditingId(null);
    setImageFile(null);
  };

  return (
    <div className="admin-panel">
      <h2>Festival Verwaltung</h2>
      
      <form className="festival-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Festival Name *"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="text"
          name="location"
          placeholder="Ort *"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="text"
          name="address"
          placeholder="Adresse"
          value={formData.address}
          onChange={handleInputChange}
        />
        
        <select
          name="region"
          value={formData.region}
          onChange={handleInputChange}
          required
        >
          <option value="tirol">Tirol</option>
          <option value="bayern">Bayern</option>
        </select>
        
        <input
          type="number"
          name="latitude"
          placeholder="Breitengrad"
          value={formData.latitude}
          onChange={handleInputChange}
          step="0.000001"
        />
        
        <input
          type="number"
          name="longitude"
          placeholder="Längengrad"
          value={formData.longitude}
          onChange={handleInputChange}
          step="0.000001"
        />
        
        <input
          type="date"
          name="start_date"
          placeholder="Startdatum *"
          value={formData.start_date}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="date"
          name="end_date"
          placeholder="Enddatum *"
          value={formData.end_date}
          onChange={handleInputChange}
          required
        />
        
        <input
          type="url"
          name="website"
          placeholder="Website"
          value={formData.website}
          onChange={handleInputChange}
        />
        
        <input
          type="email"
          name="contact_email"
          placeholder="Kontakt E-Mail"
          value={formData.contact_email}
          onChange={handleInputChange}
        />
        
        <input
          type="tel"
          name="contact_phone"
          placeholder="Kontakt Telefon"
          value={formData.contact_phone}
          onChange={handleInputChange}
        />
        
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files[0])}
        />
        
        <textarea
          name="description"
          placeholder="Beschreibung"
          value={formData.description}
          onChange={handleInputChange}
          rows="4"
        />
        
        <button type="submit">
          {editingId ? 'Festival aktualisieren' : 'Festival hinzufügen'}
        </button>
        
        {editingId && (
          <button type="button" onClick={resetForm} style={{ background: '#95a5a6' }}>
            Abbrechen
          </button>
        )}
      </form>

      <div className="admin-festival-list">
        <h3>Vorhandene Festivals</h3>
        {festivals.map(festival => (
          <div key={festival.id} className="admin-festival-item">
            <div>
              <strong>{festival.name}</strong> - {festival.location} 
              ({festival.region === 'tirol' ? 'Tirol' : 'Bayern'})
            </div>
            <div>
              <button className="edit-btn" onClick={() => handleEdit(festival)}>
                Bearbeiten
              </button>
              <button className="delete-btn" onClick={() => handleDelete(festival.id)}>
                Löschen
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;
