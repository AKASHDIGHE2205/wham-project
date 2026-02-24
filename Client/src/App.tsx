import { BrowserRouter, Route, Routes } from "react-router-dom";//Navigate,
import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import AOS from "aos";
import "aos/dist/aos.css";
import Loadings from "./components/Loadings";
import DefaultLayout from "./layout/DefaultLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import { authFinished, setUser, verifyAndLoadUser } from "./feature/authSlice";
import UsersView from "./pages/Master/users/UsersView";
import PageNotFound from "./components/PageNotFound";
import AccessDenied from "./components/AccessDenied";
import UniversityView from "./pages/Master/University/UniversityView";
import UniversityAdd from "./pages/Master/University/UniversityAdd";
import UniversityEdit from "./pages/Master/University/UniversityEdit";
import CollegeView from "./pages/Master/College/CollegeView";
import CollgeAdd from "./pages/Master/College/CollgeAdd";
import CollegeEdit from "./pages/Master/College/CollegeEdit";
import DepartmentView from "./pages/Master/department/DepartmentView";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Profile = lazy(() => import("./pages/auth/Profile"));
const Home = lazy(() => import("./pages/home/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Calender = lazy(() => import("./pages/Calender-new/Calender"));
const TeamView = lazy(() => import("./pages/Master/team-master/TeamView"));
const MemberView = lazy(() => import("./pages/Master/member-master/MemberView"));
const NewMember = lazy(() => import("./pages/Master/member-master/NewMember"));
const EditMember = lazy(() => import("./pages/Master/member-master/EditMember"));
const StepView = lazy(() => import("./pages/Master/steps/StepView"));
const TaskView = lazy(() => import("./pages/Master/task/TaskView"));
const ReportView = lazy(() => import("./pages/reports/totalReport/ReportView"));
const Logout = lazy(() => import("./pages/auth/Logout"));

function App() {
  const dispatch = useDispatch();

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
    AOS.init({ duration: 800, once: true, easing: "ease-out" });
  }, []);

  return (
    <BrowserRouter>
      <Suspense fallback={<Loadings />}>
        <Routes>
          {/* 🔐 Authenticated */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DefaultLayout />}>
              <Route index element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/calender" element={<Calender />} />

              <Route element={<ProtectedRoute allowedRoles={["Master", "Admin", "Manager"]} />}>
                <Route path="/master/team-view" element={<TeamView />} />
                <Route path="/master/view-members" element={<MemberView />} />
                <Route path="/master/add-member" element={<NewMember />} />
                <Route path="/master/edit-member/:id" element={<EditMember />} />
                <Route path="/master/view-steps" element={<StepView />} />
                <Route path="/master/view-tasks" element={<TaskView />} />
                <Route path="/master/users-view" element={<UsersView />} />
                <Route path="/report/report1" element={<ReportView />} />

                <Route path="/master/view-universities" element={<UniversityView />} />
                <Route path="/master/add-university" element={<UniversityAdd />} />
                <Route path="/master/edit-university/:id" element={<UniversityEdit />} />

                <Route path="/master/view-colleges" element={<CollegeView />} />
                <Route path="/master/add-college" element={<CollgeAdd />} />
                <Route path="/master/edit-college/:id" element={<CollegeEdit />} />

                <Route path="/master/view-departments" element={<DepartmentView />} />

              </Route>
              <Route path="/unauthorized" element={<AccessDenied />} />
              <Route path="/auth/profile" element={<Profile />} />
            </Route>

            <Route path="/auth/log-out" element={<Logout />} />
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          </Route>

          <Route path="*" element={<PageNotFound />} />
        </Routes>

      </Suspense>
    </BrowserRouter>
  );
}

export default App;