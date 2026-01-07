import { useEffect } from "react";
import { useDispatch } from "react-redux"
import { logout } from "../../feature/authSlice";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const SignOut = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(logout())
    toast.error("Logged out successfully!")
  }, [dispatch])
  return (
    <Navigate to='sign-in' />
  )
}
export default SignOut;