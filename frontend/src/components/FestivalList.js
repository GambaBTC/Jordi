import React from 'react';

function FestivalList({ festivals }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-AT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="festival-list">
      {festivals.map((festival) => (
        <div key={festival.id} className="festival-card">
          {festival.image_url && (
            <img 
              src={`http://localhost:5000${festival.image_url}`} 
              alt={festival.name}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          <div className="festival-card-content">
            <h3>{festival.name}</h3>
            <div className="festival-card-meta">
              <span>📍 {festival.location}</span>
              <span>📅 {formatDate(festival.start_date)} - {formatDate(festival.end_date)}</span>
              <span>🏷️ {festival.region === 'tirol' ? 'Tirol' : 'Bayern'}</span>
            </div>
            {festival.description && (
              <p className="festival-card-description">{festival.description}</p>
            )}
            <div className="festival-card-actions">
              {festival.website && (
                <a href={festival.website} target="_blank" rel="noopener noreferrer">
                  Website besuchen
                </a>
              )}
              {festival.contact_email && (
                <a href={`mailto:${festival.contact_email}`}>Kontakt</a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FestivalList;
