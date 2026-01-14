import "./App.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../src/custom/style.css";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./componets/ProtectedRoute";

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
import DemandGenerate from "./componets/DemandGenerate";
import { CenterProvider } from "./componets/all_login/CenterContext";
import KendraPasswordReset from "./componets/dash_board/KendraPasswordReset";
import DemandView from "./componets/dash_board/DemandView";
function App() {
  const location = useLocation();

  const hiddenPaths = new Set(["/Dashboard", "/Registration", "/KrishiRegistration", "/MainDashboard","/Billing","/AllBills","/MPR","/AddEditComponent","/DemandGenerate","/kendra-password-reset","/DemandView"]);

  const shouldHideNavbar = hiddenPaths.has(location.pathname);
  
  return (
    <CenterProvider>
    <AuthProvider>
      <div className="app-container">
        {!shouldHideNavbar && <NavBar />}
        
        <main className="main-content">
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Home />} />
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            
            {/* PROTECTED ROUTES */}
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
            <Route path="/DemandGenerate" element={
              <ProtectedRoute>
                <DemandGenerate />
              </ProtectedRoute>
            } />
            <Route path="/kendra-password-reset" element={
              <ProtectedRoute>
                <KendraPasswordReset />
              </ProtectedRoute>
            } />
            <Route path="DemandView" element={
              <ProtectedRoute>
                <DemandView />
              </ProtectedRoute>
            } />
          </Routes>

        </main>
        
        <Footer />
      </div>
    </AuthProvider>
    </CenterProvider>
  );
}

export default App;