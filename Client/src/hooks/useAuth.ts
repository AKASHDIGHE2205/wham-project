// hooks/useAuth.ts
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../feature/authSlice";
import axios from "axios";
import type { RootState } from "../store/store";
import { BASE_URL } from "../constant/Baseurl";

export const useAuth = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        dispatch(logout());
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/auth/validate-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.data.valid) {
          dispatch(logout());
        }
      } catch (error) {
        console.log(error);
        dispatch(logout());
      }
    };

    checkAuth();

    // Check every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return { isAuthenticated };
};
