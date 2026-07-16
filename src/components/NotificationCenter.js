import React from 'react';
import './NotificationCenter.css';

const NotificationCenter = ({ notifications, onDismiss }) => (
  <div className="notification-center" aria-live="polite" aria-atomic="true">
    {notifications.map((notification) => (
      <div
        key={notification.id}
        className={`notification-toast ${notification.type}`}
        role="status"
      >
        <div className="notification-copy">
          <strong>{notification.title}</strong>
          {notification.message ? <span>{notification.message}</span> : null}
        </div>
        <button
          type="button"
          className="notification-dismiss"
          onClick={() => onDismiss(notification.id)}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

export default NotificationCenter;
