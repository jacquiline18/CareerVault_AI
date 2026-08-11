import { useState, useEffect } from "react";
import axios from "axios";

export default function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    axios.get(`http://localhost:5000/api/documents/insights/${userId}`)
      .then(({ data }) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  return { profile, loading };
}
