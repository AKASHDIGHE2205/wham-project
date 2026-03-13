import AOS from "aos";
import "aos/dist/aos.css";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loadings from "./components/Loadings";
import { authFinished, setUser, verifyAndLoadUser } from "./feature/authSlice";
import DefaultLayout from "./layout/DefaultLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Profile = lazy(() => import("./pages/auth/Profile"));
const Logout = lazy(() => import("./pages/auth/Logout"));
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
const PageNotFound = lazy(() => import("./components/PageNotFound"));
const AccessDenied = lazy(() => import("./components/AccessDenied"));
const UsersView = lazy(() => import("./pages/Master/users/UsersView"));
const UniversityView = lazy(() => import("./pages/Master/University/UniversityView"));
const UniversityAdd = lazy(() => import("./pages/Master/University/UniversityAdd"));
const UniversityEdit = lazy(() => import("./pages/Master/University/UniversityEdit"));
const CollegeView = lazy(() => import("./pages/Master/College/CollegeView"));
const CollgeAdd = lazy(() => import("./pages/Master/College/CollgeAdd"));
const CollegeEdit = lazy(() => import("./pages/Master/College/CollegeEdit"));
const DepartmentView = lazy(() => import("./pages/Master/department/DepartmentView"));
const CreateActivityPage = lazy(() => import("./pages/Activities/Index"));
const UpdateActivityPage = lazy(() => import("./pages/Calender-new/Update/Index"));
const FaqView = lazy(() => import("./pages/Master/FAQ/FaqView"));
const TrainingAdd = lazy(() => import("./pages/Training/master/TrainingAdd"));
const TrainingEdit = lazy(() => import("./pages/Training/master/TrainingEdit"));
const TrainingView = lazy(() => import("./pages/Training/master/TrainingView"));
const TrainingViews = lazy(() => import("./pages/Training/Training/TrainingViews"));

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

  const masterRoutes = [
    { path: "/master/team-view", element: <TeamView /> },

    { path: "/master/view-members", element: <MemberView /> },
    { path: "/master/add-member", element: <NewMember /> },
    { path: "/master/edit-member/:id", element: <EditMember /> },

    { path: "/master/view-steps", element: <StepView /> },

    { path: "/master/view-tasks", element: <TaskView /> },

    { path: "/master/users-view", element: <UsersView /> },

    { path: "/report/report1", element: <ReportView /> },

    { path: "/master/view-universities", element: <UniversityView /> },
    { path: "/master/add-university", element: <UniversityAdd /> },
    { path: "/master/edit-university/:id", element: <UniversityEdit /> },

    { path: "/master/view-colleges", element: <CollegeView /> },
    { path: "/master/add-college", element: <CollgeAdd /> },
    { path: "/master/edit-college/:id", element: <CollegeEdit /> },

    { path: "/master/view-departments", element: <DepartmentView /> },

    { path: "/master/view-faq", element: <FaqView /> },
  ];

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
              <Route path="/trainings/manage" element={<TrainingView />} />
              <Route path="/trainings/create" element={<TrainingAdd />} />
              <Route path="/training/edit-training/:id" element={<TrainingEdit />} />
              <Route path="/my-trainings" element={<TrainingViews />} />
              <Route path="add-activity" element={<CreateActivityPage />} />
              <Route path="update-activity/:id/:date" element={<UpdateActivityPage />} />
              <Route element={<ProtectedRoute allowedRoles={["Master", "Admin", "Manager"]} />}>
                {masterRoutes.map((route, index) => (<Route key={index} path={route.path} element={route.element} />))}
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