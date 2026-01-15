import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Calender from './pages/Calender-new/Calender';
import { lazy, Suspense, useEffect } from 'react';
import AOS from "aos";
import "aos/dist/aos.css";
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './store/store';
import Loadings from './components/Loadings';
import DefaultLayout from './layout/DefaultLayout';
import Logout from './pages/auth/Logout';
import { authFinished, setUser, verifyAndLoadUser } from './feature/authSlice';

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
const ReportView = lazy(() => import('./pages/reports/totalReport/ReportView'));
const TaskView = lazy(() => import('./pages/Master/task/TaskView'));
const StepView = lazy(() => import('./pages/Master/steps/StepView'));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isAuthLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const initAuth = async () => {
      const verified = await verifyAndLoadUser();

      if (verified.isAuthenticated) {
        dispatch(setUser({ user: verified.user, token: verified.token }));
      } else {
        dispatch(authFinished());
      }
    };

    initAuth();
  }, [dispatch]);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out",
    });
  }, []);

  if (isAuthLoading) {
    return <Loadings />;
  }
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

              {/*Report Routes */}
              <Route path='/report/report1' element={<ReportView />} />

              {/*Profile Routes */}
              <Route path="/auth/profile" element={<Profile />} />
            </Route>

            <Route path="/auth/log-out" element={<Logout />} />
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