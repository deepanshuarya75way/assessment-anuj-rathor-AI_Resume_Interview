import React from "react";
import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";

import { AuthProvider } from "./features/auth/auth.context.jsx";
import { SessionProvider } from "./features/interview/session.context";
import { InterviewProvider } from "./features/interview/interview.context";

import { ResumeProvider } from "./features/resume/context/resume.context";

function App() {
  return (
    <AuthProvider>
      <SessionProvider>
        <InterviewProvider>
          <ResumeProvider>
            <RouterProvider router={router} />
          </ResumeProvider>
        </InterviewProvider>
      </SessionProvider>
    </AuthProvider>
  );
}

export default App;