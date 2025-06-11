import { useEffect, useState } from "react";

export default function Notifications({ idEnseignant, idChef }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Déterminer l'utilisateur cible et son type
  const userId = idEnseignant || idChef;
  const type = idEnseignant ? "enseignant" : "chef";

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    fetch(`http://localhost:6000/notification?userId=${userId}&type=${type}`)
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, type]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h4>Notifications</h4>
      <ul>
        {notifications.length === 0 && <li>Aucune notification</li>}
        {notifications.map((notif) => (
          <li
            key={notif.id}
            style={{
              fontWeight: notif.lire ? "normal" : "bold",
              background: notif.lire ? "#f5f5f5" : "#e3f2fd",
              marginBottom: 8,
              padding: 8,
              borderRadius: 5,
            }}
          >
            {notif.message} <br />
            <small>{new Date(notif.dateCreation).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}