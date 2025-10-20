// components/Layout.js
import Sidebar from './Sidebar';
//import './Layout.css'; // If you have layout-specific styles

const Layout = ({ children }) => {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        {children}
      </div>
    </div>
  );
};

export default Layout;