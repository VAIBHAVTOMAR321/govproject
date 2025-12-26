import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row, Form, Alert, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "", // This can be either email or username
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChangeOption, setShowPasswordChangeOption] = useState(false);
  const [tempUserData, setTempUserData] = useState(null);

  // Handle navigation based on user authentication status
  useEffect(() => {
    if (isAuthenticated) {
     
      const timer = setTimeout(() => {
        // All roles redirect to MainDashboard
        navigate("/MainDashboard", { replace: true });
      }, 1500); // 1.5 second delay

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, navigate]); // Removed user from dependencies to avoid timing issues

  // Handle Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError("");
    setSuccess("");
    setShowPasswordChangeOption(false);
    
    if (!formData.identifier || !formData.password) {
      setError("कृपया सभी आवश्यक फ़ील्ड भरें!");
      return;
    }
    
    setIsLoading(true);
   
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.identifier);
    
    try {
      const response = await fetch("https://fe7959ee588b.ngrok-free.app/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Send either email or username based on input
          ...(isEmail ? { email: formData.identifier } : { username: formData.identifier }),
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      console.log("API Response:", data); // Debug log
      
      // Check for password change requirement in either message or error field
      const passwordChangeMsg = data.message || data.error || "";
      const isPasswordChangeRequired = passwordChangeMsg === "You must change your default password before login";
      
      if (response.ok) {
        if (isPasswordChangeRequired) {
          // Store user data for password change page
          setTempUserData({
            user_id: data.user_id,
            role: data.role,
            email: data.email || formData.identifier,
            username: data.username || (!isEmail ? formData.identifier : ""),
          });
          // Show the password change message and option
          setError(passwordChangeMsg);
          setShowPasswordChangeOption(true);
          return;
        }
        
        // Show success message
        setSuccess("लॉगिन सफलतापूर्वक पूर्ण हुआ!");
        
        // Call login with user data including role
        login({
          user_id: data.user_id,
          role: data.role,
          email: data.email || formData.identifier, // Use email from response if available
          username: data.username || (!isEmail ? formData.identifier : ""), // Use username from response if available
        });
      } else {
        // Handle error response
        if (isPasswordChangeRequired) {
          // Store user data for password change page
          setTempUserData({
            user_id: data.user_id,
            role: data.role,
            email: data.email || formData.identifier,
            username: data.username || (!isEmail ? formData.identifier : ""),
          });
          // Show the password change message and option
          setError(passwordChangeMsg);
          setShowPasswordChangeOption(true);
        } else {
          // Display the error message from API or default message
          setError(passwordChangeMsg || "लॉगिन विफल। कृपया अपने क्रेडेंशियल्स जांचें।");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("सर्वर से कनेक्ट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change button click
  const handleChangePasswordClick = () => {
    // Store user data temporarily for the password change page
    localStorage.setItem('tempUserData', JSON.stringify(tempUserData));
    navigate("/ForgotPassword", { replace: true });
  };

  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col md={10} lg={8} xl={6} className="mt-5">
            <div className="login-container shadow-lg">
              <Row className="g-0">
                <Col md={6} className="login-image d-none d-md-block">
                  <div className="image-overlay">
                    <h2>स्वागत है</h2>
                    <p>कृपया अपने खाते में लॉगिन करें</p>
                  </div>
                </Col>
                <Col md={6} className="p-4 p-md-5">
                  <div className="login-form">
                    <h3 className="mb-4 text-center">लॉगिन</h3>
                    
                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                    {success && <Alert variant="success" className="mb-4">{success}</Alert>}
                    
                    {showPasswordChangeOption && (
                      <div className="text-center change-password mb-4">
                        <p 
                         
                          onClick={handleChangePasswordClick}
                        
                        >
                          Change Password
                        </p>
                      </div>
                    )}
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>ईमेल या उपयोगकर्ता नाम</Form.Label>
                        <Form.Control
                          type="text"
                          name="identifier"
                          placeholder="ईमेल या उपयोगकर्ता नाम दर्ज करें"
                          value={formData.identifier}
                          onChange={handleChange}
                          className="form-control-lg"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>पासवर्ड</Form.Label>
                        <div className="password-input-container">
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="पासवर्ड दर्ज करें"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-control-lg"
                            required
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </Form.Group>

                      <div className="d-flex justify-content-between align-items-center forget-btn mb-4">
                        <Form.Check
                          type="checkbox"
                          id="remember-me"
                          label="मुझे याद रखें"
                          className="remember-me"
                        />
                        <p className="mb-0">
                          <Link to="/ForgotPassword" className="text-decoration-none">
                            पासवर्ड भूल गए?
                          </Link>
                        </p>
                      </div>
                      <div className="text-center">
                        <Button 
                          type="submit" 
                          className="login-btn" 
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                              <span className="ms-2">लॉगिन हो रहे हैं...</span>
                            </>
                          ) : (
                            "लॉगिन"
                          )}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}