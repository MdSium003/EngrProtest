import React, { useEffect, useState } from 'react';

// Access the backend URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

// --- MODIFICATION: Added a placeholder for the Google Docs link ---
// Replace this with your actual Google Docs form URL
const GOOGLE_DOCS_URL = 'https://forms.gle/vak8SqGK3evSB7zc7';

const InjuredList = ({ token }) => {
  const [injured, setInjured] = useState([]);
  const [pending, setPending] = useState([]);
  
  // --- MODIFICATION: State for the admin form, similar to Gallery.js ---
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [pictureUrl, setPictureUrl] = useState(''); // Replaces the 'file' state
  
  const isAdmin = Boolean(token);

  const fetchApproved = async () => {
    const res = await fetch(`${API_URL}/api/injured`);
    const data = await res.json();
    setInjured(data);
  };
  
  const fetchPending = async () => {
    if (!isAdmin) return;
    const res = await fetch(`${API_URL}/api/injured/pending`, {
      headers: { 'x-auth-token': token }
    });
    const data = await res.json();
    setPending(data);
  };

  useEffect(() => {
    (async () => {
      await fetchApproved();
      if (token) {
        await fetchPending();
      }
    })();
  }, [token]);

  // --- MODIFICATION: New handler for the admin form submission ---
  // This works like the 'handleAdd' function in Gallery.js
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!name || !details || !pictureUrl) return; // Basic validation
    
    await fetch(`${API_URL}/api/injured`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Sending JSON, not FormData
        'x-auth-token': token
      },
      body: JSON.stringify({ name, details, picture_url: pictureUrl })
    });
    
    // Reset form fields
    setName('');
    setDetails('');
    setPictureUrl('');
    
    // Refresh lists
    fetchApproved();
    fetchPending();
  };

  const handleApprove = async (id) => {
    await fetch(`${API_URL}/api/injured/approve/${id}`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
    fetchApproved();
    fetchPending();
  };

  return (
    <div>
      <h2>Record of the Injured</h2>

      {/* --- MODIFICATION: Conditional rendering for the submission section --- */}
      {isAdmin ? (
        // ADMIN VIEW: Form to add directly, like the gallery
        <form onSubmit={handleAdminSubmit} className="form-container">
          <h3>Add New Record (Admin)</h3>
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <textarea placeholder="Details (e.g., location, date, injury)" value={details} onChange={(e) => setDetails(e.target.value)} required />
          <input type="url" placeholder="Direct image URL (https://...)" value={pictureUrl} onChange={(e) => setPictureUrl(e.target.value)} required />
          <button type="submit" className="btn">Add Record</button>
        </form>
      ) : (
        // PUBLIC VIEW: Button that links to Google Docs
        <div className="form-container" style={{ textAlign: 'center' }}>
            <p style={{ margin: '0 0 1rem', color: 'var(--secondary-text-color)' }}>
                To add a record of an injured person, please submit the details through our official form.
            </p>
            <a href={GOOGLE_DOCS_URL} target="_blank" rel="noopener noreferrer" className="btn">
                Submit a Record
            </a>
        </div>
      )}

      {/* The rest of the component remains the same */}
      <hr />

      <h3>Approved Records</h3>
      {injured.length > 0 ? injured.map((p) => (
        <div className="card" key={p.id}>
          <div className="injured-card-content">
            {p.picture_url && <img src={p.picture_url} alt={p.name} />}
            <div>
              <strong>{p.name}</strong>
              <p>{p.details}</p>
            </div>
          </div>
        </div>
      )) : <p>No approved records to display.</p>}


      {isAdmin && (
        <>
          <hr />
          <h3>Pending Approval</h3>
          {pending.length > 0 ? pending.map((p) => (
            <div className="card" key={p.id}>
              <div className="injured-card-content">
                {p.picture_url && <img src={p.picture_url} alt={p.name} />}
                <div>
                  <strong>{p.name}</strong>
                  <p>{p.details}</p>
                </div>
              </div>
              <div className="admin-actions">
                <button onClick={() => handleApprove(p.id)} className="btn">Approve</button>
              </div>
            </div>
          )) : <p>No pending submissions.</p>}
        </>
      )}
    </div>
  );
};

export default InjuredList;