import React, { useState, useEffect } from "react"; // 1. ADD useEffect
import { Button, Col, Container, Row, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // 2. IMPORT useAuth
import "../../assets/css/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth(); // 3. GET login & isAuthenticated

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 4. ADD useEffect TO HANDLE NAVIGATION
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/MainDashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit handler (YOUR API LOGIC REMAINS THE SAME)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("कृपया सभी आवश्यक फ़ील्ड भरें!");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await fetch("https://mahadevaaya.com/govbillingsystem/backend/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // 5. ON SUCCESS, JUST CALL THE CONTEXT'S login FUNCTION
        // We don't need to check for a token, just call login()
        login();
        
        // REMOVE the manual navigate() call. The useEffect handles it now.
        
      } else {
        // Handle error response
        setError(data.message || "लॉगिन विफल। कृपया अपने क्रेडेंशियल्स जांचें।");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("सर्वर से कनेक्ट करने में त्रुटि। कृपया बाद में पुन: प्रयास करें।");
    } finally {
      setIsLoading(false);
    }
  };

  // Your JSX remains exactly the same...
  return (
    <div className="login-page">
      <Container>
        <Row className="justify-content-center align-items-center ">
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
                    
                    <Form onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>ईमेल</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="ईमेल दर्ज करें"
                          value={formData.email}
                          onChange={handleChange}
                          className="form-control-lg"
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

                      <div className="d-flex justify-content-center mb-2">
                        <Form.Check
                          type="checkbox"
                          id="remember-me"
                          label="मुझे याद रखें"
                          className="remember-me"
                        />
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