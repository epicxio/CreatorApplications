import { NotificationVariablesInfo } from './NotificationVariablesInfo';
import axios from 'axios';
import React, { useState } from 'react';

const NotificationControlCenter = () => {
  const [variables, setVariables] = useState<{ variable: string; description: string }[]>([]);

  const handleScan = async () => {
    const res = await axios.post('/api/notification-events/scan');
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