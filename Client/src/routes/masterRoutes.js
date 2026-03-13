export const masterRoutes = [
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
];