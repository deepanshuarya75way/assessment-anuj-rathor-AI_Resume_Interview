import {createBrowserRouter} from 'react-router';
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import Protected from './features/auth/components/Protected';
import Home from './features/interview/pages/Home';
import Interview from './features/interview/pages/Interview';
import Resume from "./features/resume/pages/ResumeBuilder";
import Mock from './features/mock/pages/mock';

export const router = createBrowserRouter([
{
  path :"/login",
  element : <Login/>
},
{
  path :"/register",
  element : <Register/>
},{
  path:"/",
  element:<Protected><Home/></Protected>
},{
  path:"/interview/:interviewId",
  element:<Protected><Interview /></Protected>
},{
  path:"/mock",
  element:<Protected><Mock /></Protected>
},{
  path:"/mock/:interviewId",
  element:<Protected><Mock /></Protected>
},
 {
    path: "/resume/:id",
    element:<Protected><Resume /></Protected>
  }
]);
