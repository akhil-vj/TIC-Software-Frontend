import { useState, useEffect } from "react";
import axios from "axios";
import axiosInstance from "../../services/AxiosInstance";
import { useSelector } from "react-redux";

export const useAsync = (url, condition = true) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  //   const [url, setUrl] = useState(initialUrl);
  const refresh = useSelector((state) => state.form.refresh);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance().get(url);
        setData(response.data);
      } catch (error) {
        setError(error);
      }

      setLoading(false);
    };

    if (url && condition) {
      fetchData();
    }
  }, [url, condition, refresh]);

  return { data, error, loading };
};
