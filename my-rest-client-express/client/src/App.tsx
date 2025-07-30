import { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<History[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // mobile state
  const [activeTab, setActiveTab] = useState<'request' | 'history'>('request');

  const fetchHistory = async (page: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history?page=${page}&limit=10`);
      const data: HistoryResponse = await res.json();
      if (data && data.data) {
        setHistory(data.data);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      const externalRes = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: ['POST', 'PUT'].includes(method) ? body : undefined,
      });
      const responseData = await externalRes.json();
      setResponse({ status: externalRes.status, data: responseData });

      await fetch(`${API_BASE_URL}/api/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method,
          url,
          statusCode: externalRes.status,
          responseBody: responseData,
        }),
      });
      fetchHistory(1);
    } catch (error: any) {
      setResponse({ status: 500, data: { message: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const getMethodClass = (h: History) => {
    if (h.statusCode && h.statusCode >= 400) return 'method-error';
    switch (h.method.toUpperCase()) {
      case 'GET': return 'method-get';
      case 'POST': return 'method-post';
      case 'PUT': return 'method-put';
      case 'DELETE': return 'method-delete';
      default: return '';
    }
  };

  return (
    <div className={`app-container ${activeTab}-active`}>
      {/* Mobile Tab Buttons */}
      <div className="mobile-tabs">
        <button
          className={`tab-button ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          Request
        </button>
        <button
          className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
      </div>

      {/* History Panel */}
      <div className="history-panel">
        <h2>History</h2>
        <ul className="history-list">
          {history?.map((h) => (
            <li key={h.id} onClick={() => { setUrl(h.url); setMethod(h.method); }}>
              <strong className={getMethodClass(h)}>
                {h.method}
              </strong> - {h.url}
            </li>
          ))}
        </ul>
        <div className="pagination-controls">
          <button onClick={() => fetchHistory(currentPage - 1)} disabled={currentPage <= 1}>
            Previous
          </button>
          <span> Page {currentPage} of {totalPages} </span>
          <button onClick={() => fetchHistory(currentPage + 1)} disabled={currentPage >= totalPages}>
            Next
          </button>
        </div>
      </div>

      {/* Request Panel */}
      <div className="main-panel">
        <h1>REST Client</h1>
        <div className="request-controls">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/data"
          />
          <button onClick={handleSendRequest} disabled={loading || !url}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>

        {['POST', 'PUT'].includes(method) && (
          <textarea
            className="body-textarea"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{ "key": "value" }'
          />
        )}

        <h2>Response</h2>
        <div className="response-area">
          {response && (
            <pre>
              <p>Status: {response.status}</p>
              <code>{JSON.stringify(response.data, null, 2)}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
