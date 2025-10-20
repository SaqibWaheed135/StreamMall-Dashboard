import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Withdraw from './Pages/Withdraw';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import UsersList from './Pages/Users';
import AddAdForm from './Pages/Ads';
import AdList from './Pages/AdLists';
import EditAdForm from './components/EditAdForm';
import VideoListApproval from './Pages/ApprovalVideoList';
import ApprovedVideoList from './Pages/ApprovedVideoList';
import VideoUpload from './Pages/AdVideo';
import ReportedVideos from './Pages/VideoReports';
import RechargeAdmin from './Pages/Recharge';
import AdminSettingsPage from './Pages/Settings';
import LiveOrders from './Pages/LiveOrders';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Protected Routes inside layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/live-orders"
          element={
            <ProtectedRoute>
              <Layout>
                <LiveOrders />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <Layout>
                <Withdraw />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/recharge"
          element={
            <ProtectedRoute>
              <Layout>
                <RechargeAdmin />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UsersList />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-upload"
          element={
            <ProtectedRoute>
              <Layout>
                <VideoUpload />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/video-approval"
          element={
            <ProtectedRoute>
              <Layout>
                <VideoListApproval />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/approved-video"
          element={
            <ProtectedRoute>
              <Layout>
                <ApprovedVideoList />
              </Layout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/ads"
          element={
            <ProtectedRoute>
              <Layout>
                <AddAdForm />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/ads-lists"
          element={
            <ProtectedRoute>
              <Layout>
                <AdList />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reported-videos"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportedVideos />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/ads/edit/:id" element={<EditAdForm />} />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <AdminSettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />


      </Routes>
    </Router>
  );
}

export default App;