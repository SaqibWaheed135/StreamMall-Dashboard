// // src/components/ProtectedRoute.js
// import { Navigate } from 'react-router-dom';

// const ProtectedRoute = ({ children }) => {
//   const token = localStorage.getItem('token');

//   if (!token) {
//     // Redirect to login if no token
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;

// components/ProtectedRoute.js
import { useContext, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const timer = useRef();

  const startLogoutTimer = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      logout();
      alert('Logged out due to 5 minutes of inactivity.');
    }, 5 * 60 * 1000); // 5 minutes
  };

  useEffect(() => {
    const resetTimer = () => startLogoutTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    startLogoutTimer(); // Start timer initially

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timer.current);
    };
  }, []);

  if (!isAuthenticated) return <Navigate to="/" />;
  return children;
};

export default ProtectedRoute;