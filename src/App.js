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
import DemandCenterwiseEntry from "./componets/DemandCenterwiseEntry";
import DemandKrishiwiseEntry from "./componets/DemandKrishiwiseEntry";
import { CenterProvider } from "./componets/all_login/CenterContext";
import KendraPasswordReset from "./componets/dash_board/KendraPasswordReset";
import DemandView from "./componets/dash_board/DemandView";
import NurseryFinancialEntry from "./componets/dash_board/NurseryFinancialEntry";
import NurseryPhysicalEntry from "./componets/dash_board/NurseryPhysicalEntry";
function App() {
  const location = useLocation();

  const hiddenPaths = new Set(["/Dashboard", "/Registration", "/KrishiRegistration", "/MainDashboard","/Billing","/AllBills","/MPR","/AddEditComponent","/DemandGenerate","/DemandGenerate/CenterwiseEntry","/DemandGenerate/KrishiwiseEntry","/KendraPasswordReset","/DemandView","/NurseryFinancialEntry","/NurseryPhysicalEntry"]);

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
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <Dashboard />
              </ProtectedRoute>
            } />
           
            <Route path="/Registration" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <Registration />
              </ProtectedRoute>
            } />
            <Route path="/KrishiRegistration" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <KrishiRegistration />
              </ProtectedRoute>
            } />
            <Route path="/MainDashboard" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <MainDashboard />
              </ProtectedRoute>
            } />
            <Route path="/Billing" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/AllBills" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <AllBills />
              </ProtectedRoute>
            } />
            <Route path="/MPR" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <MPR />
              </ProtectedRoute>
            } />
            <Route path="/AddEditComponent" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <AddEditComponent />
              </ProtectedRoute>
            } />
             <Route path="/DemandGenerate" element={
               <ProtectedRoute allowedLoginTypes={["demand"]}>
               <DemandGenerate />
               </ProtectedRoute>
             } />
             <Route path="/DemandGenerate/CenterwiseEntry" element={
               <ProtectedRoute allowedLoginTypes={["demand"]}>
               <DemandCenterwiseEntry />
               </ProtectedRoute>
             } />
             <Route path="/DemandGenerate/KrishiwiseEntry" element={
               <ProtectedRoute allowedLoginTypes={["demand"]}>
               <DemandKrishiwiseEntry />
               </ProtectedRoute>
             } />
            <Route path="/KendraPasswordReset" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <KendraPasswordReset />
              </ProtectedRoute>
            } />
            <Route path="/DemandView" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <DemandView />
              </ProtectedRoute>
            } />
            <Route path="/NurseryFinancialEntry" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <NurseryFinancialEntry />
              </ProtectedRoute>
            } />
            <Route path="/NurseryPhysicalEntry" element={
              <ProtectedRoute allowedLoginTypes={["regular"]}>
                <NurseryPhysicalEntry />
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