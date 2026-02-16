import { NotificationVariablesInfo } from './NotificationVariablesInfo';
import axios from 'axios';
import React, { useState } from 'react';

const API_BASE = process.env.REACT_APP_API_URL || (process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : 'http://localhost:5001/api');

const NotificationControlCenter = () => {
  const [variables, setVariables] = useState<{ variable: string; description: string }[]>([]);

  const handleScan = async () => {
    const res = await axios.post(`${API_BASE}/notification-events/scan`);
    if (res.data && res.data.variables) {
      setVariables(res.data.variables);
    }
    // ... handle events, skipped, inserted as needed
  };

  return (
    <div>
      {/* ...other UI... */}
      <button onClick={handleScan}>Scan for Notification Events</button>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <span style={{ color: '#888', fontSize: 12, marginRight: 4 }}>
          Available template variables
        </span>
        <NotificationVariablesInfo variables={variables} />
      </div>
      <textarea /* your message template input props here */ />
      {/* ...rest of your form... */}
    </div>
  );
};

export default NotificationControlCenter; 