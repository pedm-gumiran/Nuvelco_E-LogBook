import React, { Suspense, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/Layouts/Layout.jsx';
//import PrivateRoute from './components/Layouts/PrivateRoute.jsx';
import { UserProvider } from './components/context/UserContext.jsx';
import GlobalErrorBoundary from './pages/Fallback/GlobalErrorBoundary.jsx';
import historyManager from './utils/historyManager.js';



const NotFound = React.lazy(
  () => import('./pages/Fallback/Not_Found.jsx'),
);
import LoadingSpinner from './components/Loading_UI/LoadingSpinner.jsx';

// Lazy load the Dashboard Pages
const LandingPage = React.lazy(() => import('./pages/Dashboard/LandingPage.jsx'));
const Home_Page = React.lazy(() => import('./pages/Dashboard/Home_Page.jsx'));
const Intern = React.lazy(() => import('./pages/Dashboard/Intern.jsx'));
const Backup_Restore = React.lazy(() => import('./pages/Dashboard/Backup_Restore.jsx'));
const School = React.lazy(() => import('./pages/Dashboard/School.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <GlobalErrorBoundary />,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <LandingPage />
          </Suspense>
        ),
      },
      
       {
        path: 'home',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Home_Page />
          </Suspense>
        ),
      },
      {
        path: 'intern',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Intern />
          </Suspense>
        ),
      },
      {
        path: 'school',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <School />
          </Suspense>
        ),
      },
      {
        path: 'backup_restore',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <Backup_Restore />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export default function App() {
  // Initialize history manager on app load
  useEffect(() => {
    historyManager.init()
  }, [])

  return (
    <UserProvider>
     
        <div className="bg-gray-50 font-sans">
          <RouterProvider router={router} />
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable={false}
            theme="light"
            transition={Slide}
            limit={3}
          />
        </div>

    </UserProvider>
  );
}
