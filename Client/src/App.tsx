/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Calender from './pages/Calender-new/Calender';
import { lazy, Suspense, useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store/store';
import { BASE_URL, secretKey } from './constant/Baseurl';
import axios from 'axios';
import { login, logout } from './feature/authSlice';
import CryptoJS from "crypto-js";
import Loadings from './components/Loadings';
import DefaultLayout from './layout/DefaultLayout';
import Logout from './pages/auth/Logout';
import StepView from './pages/Master/steps/StepView';
import TaskView from './pages/Master/task/TaskView';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Profile = lazy(() => import('./pages/auth/Profile'));
const Home = lazy(() => import('./pages/home/Home'));
const TeamView = lazy(() => import('./pages/Master/team-master/TeamView'));
const MemberView = lazy(() => import('./pages/Master/member-master/MemberView'));
const NewMember = lazy(() => import('./pages/Master/member-master/NewMember'));
const EditMember = lazy(() => import('./pages/Master/member-master/EditMember'));
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const response = await axios.get(`${BASE_URL}/auth/validate-token`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const decryptUser = (encrypted: string | null) => {
            if (!encrypted) return null;
            try {
              const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
              return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
            } catch (error) {
              console.error("Decryption failed", error);
              return null;
            }
          };
          if (response.status === 200) {
            const user = decryptUser(localStorage.getItem('user'));
            dispatch(login({ data: { ...user, token } }));
          }
        } catch (error: any) {
          console.log(error);
          dispatch(logout());
        }
      }
    };

    validateToken();
  }, [dispatch]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
    });
  }, []);

  return (
    <BrowserRouter>
      {isAuthenticated ? (
        <Suspense fallback={<Loadings />}>
          <Routes>
            <Route path="/" element={<DefaultLayout />}>
              <Route index element={<Home />} />

              {/*Dashboard Routes */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/*Calender Routes */}
              <Route path="/calender" element={<Calender />} />

              {/*Master Routes */}
              <Route path="/master/team-view" element={<TeamView />} />
              <Route path="/master/view-members" element={<MemberView />} />
              <Route path="/master/add-member" element={<NewMember />} />
              <Route path="/master/edit-member/:id" element={<EditMember />} />

              <Route path="/master/view-steps" element={<StepView />} />
              <Route path="/master/view-tasks" element={<TaskView />} />


              {/*Profile Routes */}
              <Route path="/auth/profile" element={<Profile />} />
            </Route>

            <Route path="/log-out" element={<Logout />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      ) : (
        <Routes>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />

          {/* ✅ Fixed redirect */}
          <Route path="*" element={<Navigate to="/auth/login" />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;