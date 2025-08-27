import React, { useEffect, useState } from 'react';

const FacebookPosts = ({ token }) => {
  const [posts, setPosts] = useState([]);
  const [pending, setPending] = useState([]);
  const [link, setLink] = useState('');
  const isAdmin = Boolean(token);

  const fetchApproved = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
  };
  const fetchPending = async () => {
    if (!isAdmin) return;
    const res = await fetch('/api/posts/pending', {
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
    if (!link) return;
    await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facebook_link: link })
    });
    setLink('');
    // No need to call fetch functions here, they'll be called on successful submission action
    alert('Submission received, awaiting approval.');
  };

  const handleApprove = async (id) => {
    await fetch(`/api/posts/approve/${id}`, {
      method: 'PUT',
      headers: { 'x-auth-token': token }
    });
    fetchApproved();
    fetchPending();
  };

  return (
    <div>
      <h2>Facebook Posts</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter Facebook post link to submit for approval"
          required
        />
        <button type="submit" className="btn">Submit</button>
      </form>

      <h3>Approved Posts</h3>
      {posts.map((p) => (
        <div className="card" key={p.id}>
          <a href={p.facebook_link} target="_blank" rel="noopener noreferrer">{p.facebook_link}</a>
        </div>
      ))}

      {isAdmin && (
        <>
          <h3>Pending Approval</h3>
          {pending.length > 0 ? pending.map((p) => (
            <div className="card" key={p.id}>
              <a href={p.facebook_link} target="_blank" rel="noopener noreferrer">{p.facebook_link}</a>
              <div className="admin-actions">
                <button onClick={() => handleApprove(p.id)} className="btn">Approve</button>
              </div>
            </div>
          )) : <p>No pending posts.</p>}
        </>
      )}
    </div>
  );
};

export default FacebookPosts;