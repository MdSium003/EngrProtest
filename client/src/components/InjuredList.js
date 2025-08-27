import React, { useEffect, useState } from 'react';

// Access the backend URL from environment variables
const API_URL = process.env.REACT_APP_API_URL;

const InjuredList = ({ token }) => {
  const [injured, setInjured] = useState([]);
  const [pending, setPending] = useState([]);
  const [name, setName] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState(null);
  const isAdmin = Boolean(token);

  const fetchApproved = async () => {
    // Use the full URL
    const res = await fetch(`${API_URL}/api/injured`);
    const data = await res.json();
    setInjured(data);
  };
  const fetchPending = async () => {
    if (!isAdmin) return;
    // Use the full URL
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', name);
    form.append('details', details);
    if (file) form.append('picture', file);
    // Use the full URL
    await fetch(`${API_URL}/api/injured`, {
      method: 'POST',
      body: form
    });
    setName('');
    setDetails('');
    setFile(null);
    e.target.reset(); // Reset file input
    alert('Submission received. It will be shown after admin approval.');
  };

  const handleApprove = async (id) => {
    // Use the full URL
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
      <form onSubmit={handleSubmit} className="form-container">
        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="Details (e.g., location, date, nature of injury)" value={details} onChange={(e) => setDetails(e.target.value)} required />
        <label htmlFor="file-upload" style={{ display: 'block', marginBottom: '1rem', color: 'var(--secondary-text-color)' }}>
            Upload a picture (optional but recommended)
        </label>
        <input type="file" id="file-upload" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" className="btn">Submit for Approval</button>
      </form>

      <h3>Approved Records</h3>
      {injured.map((p) => (
        <div className="card" key={p.id}>
          <div className="injured-card-content">
            {p.picture_url && <img src={p.picture_url} alt={p.name} />}
            <div>
              <strong>{p.name}</strong>
              <p>{p.details}</p>
            </div>
          </div>
        </div>
      ))}

      {isAdmin && (
        <>
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
