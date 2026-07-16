import { useCallback, useRef, useState } from 'react';

/**
 * Manages transient notifications for asynchronous UI actions.
 *
 * @param {number} defaultDurationMs - Default time before a toast dismisses.
 * @returns {{
 *   notifications: Array<{id: number, type: string, title: string, message?: string}>,
 *   notify: (notification: {type: string, title: string, message?: string, durationMs?: number}) => void,
 *   dismiss: (id: number) => void,
 * }}
 */
const useNotifications = (defaultDurationMs = 3500) => {
  const [notifications, setNotifications] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    ({ type, title, message = '', durationMs = defaultDurationMs }) => {
      idRef.current += 1;
      const id = idRef.current;

      setNotifications((current) => [...current, { id, type, title, message }]);

      window.setTimeout(() => {
        dismiss(id);
      }, durationMs);
    },
    [defaultDurationMs, dismiss]
  );

  return { notifications, notify, dismiss };
};

export default useNotifications;
