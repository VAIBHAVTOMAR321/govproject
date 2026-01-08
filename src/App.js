import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../src/custom/style.css";
import {
  // BrowserRouter as Router, // Not needed here, it's in index.js
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// 1. IMPORT AuthProvider and ProtectedRoute
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./componets/ProtectedRoute"; // Make sure this path is correct

import Home from "./componets/pages/Home";
import NavBar from "./componets/topnav/NavBar";
import Footer from "./componets/footer/Footer";
import Dashboard from "./componets/dash_board/Dashboard";

import Registration from "./componets/dash_board/Registration";
import KrishiRegistration from "./componets/dash_board/KrishiRegistration";
import MainDashboard from "./componets/dash_board/MainDashboard";
import Billing from "./componets/dash_board/Billing";
import AllBills from "./componets/dash_board/AllBills";
import MPR from "./componets/dash_board/MPR";
import AddEditComponent from "./componets/dash_board/AddEditComponent";
import ForgotPassword from "./componets/all_login/ForgotPassword";


function App() {
  const location = useLocation();

  const hiddenPaths = new Set(["/Dashboard", "/Registration", "/KrishiRegistration", "/MainDashboard","/Billing","/AllBills","/MPR","/AddEditComponent"]);

  const hiddenFooter1 = new Set([""]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  hiddenFooter1.has(location.pathname);
  
  return (
    // 2. WRAP YOUR ENTIRE APP WITH AuthProvider
    <AuthProvider>
      {!shouldHideNavbar && <NavBar />}

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Home />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        
        {/* 3. PROTECTED ROUTES */}
        {/* Wrap all routes that should only be accessible to logged-in users */}
        <Route path="/Dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
       
        <Route path="/Registration" element={
          <ProtectedRoute>
            <Registration />
          </ProtectedRoute>
        } />
        <Route path="/KrishiRegistration" element={
          <ProtectedRoute>
            <KrishiRegistration />
          </ProtectedRoute>
        } />
        <Route path="/MainDashboard" element={
          <ProtectedRoute>
            <MainDashboard />
          </ProtectedRoute>
        } />
        <Route path="/Billing" element={
          <ProtectedRoute>
            <Billing />
          </ProtectedRoute>
        } />
        <Route path="/AllBills" element={
          <ProtectedRoute>
            <AllBills />
          </ProtectedRoute>
        } />
        <Route path="/MPR" element={
          <ProtectedRoute>
            <MPR />
          </ProtectedRoute>
        } />
        <Route path="/AddEditComponent" element={
          <ProtectedRoute>
            <AddEditComponent />
          </ProtectedRoute>
        } />
      </Routes>

      <Footer />
    </AuthProvider>
  );
}

export default App;