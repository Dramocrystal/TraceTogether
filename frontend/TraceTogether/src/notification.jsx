import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './Notification.css';

const NotificationType = {
  WARNING: 'warning',
  SUCCESS: 'success',
  ERROR: 'error',
  OTHER: 'other'
};

const NotificationContainer = forwardRef((props, ref) => {
  const [notifications, setNotifications] = useState([]);
  const notificationTimers = useRef({});

  const getNotificationStyles = (type) => {
    switch (type) {
      case NotificationType.WARNING:
        return {
          backgroundColor: 'rgb(255, 152, 0)',
          icon: <AlertTriangle className="notification-icon" />
        };
      case NotificationType.SUCCESS:
        return {
          backgroundColor: 'rgb(76, 175, 80)',
          icon: <CheckCircle className="notification-icon" />
        };
      case NotificationType.ERROR:
        return {
          backgroundColor: 'rgb(244, 67, 54)',
          icon: <XCircle className="notification-icon" />
        };
      case NotificationType.OTHER:
        return {
          backgroundColor: 'rgb(66, 66, 66)',
          icon: <Loader2 className="notification-icon spinning" />
        };
      default:
        return {
          backgroundColor: 'rgb(66, 66, 66)',
          icon: null
        };
    }
  };

  useImperativeHandle(ref, () => ({
    addNotification: (message, type = NotificationType.SUCCESS, duration = 5000) => {
      const id = Date.now();
      const newNotification = { id, message, type };
      
      setNotifications(prev => [...prev, newNotification]);

      if (notificationTimers.current[id]) {
        clearTimeout(notificationTimers.current[id]);
      }

      notificationTimers.current[id] = setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }));

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    if (notificationTimers.current[id]) {
      clearTimeout(notificationTimers.current[id]);
      delete notificationTimers.current[id];
    }
  };

  return (
    <div className="notification-container">
      {notifications.map(({ id, message, type }) => {
        const { backgroundColor, icon } = getNotificationStyles(type);
        
        return (
          <div
            key={id}
            className="notification"
            style={{ backgroundColor }}
          >
            <div className="notification-content">
              {icon}
              <span className="notification-message">{message}</span>
            </div>
            
            <button
              onClick={() => removeNotification(id)}
              className="notification-close-button"
            >
              <X className="close-icon" />
            </button>

            <div className="progress-bar-container">
              <div className="progress-bar" />
            </div>
          </div>
        );
      })}
    </div>
  );
});

NotificationContainer.displayName = 'NotificationContainer';

export default NotificationContainer;