import React, { useState } from 'react';
import "../../assets/css/seedfarmers.css";

const SeedFarmers = () => {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'होम' },
    { id: 'distribution', label: '✍️ वितरण' },
    { id: 'stock', label: '📦 स्टॉक' },
    { id: 'standard', label: '⚙️ मानक' },
    { id: 'report', label: '📊 रिपोर्ट' },
  ];

  return (
    <div className="school-finance-app">
      {/* Top Header */}
      <header className="top-header">
        <div className="left">
          <div className="logo">SF</div>
          <h1>कृषि विभाग — बीज वितरण प्रबंधन</h1>
        </div>
        <div className="right">
          <span>होम</span>
          <span>प्रोफ़ाइल</span>
          <span>सूचनाएं</span>
          <span>लॉगआउट</span>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="container">
        
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="tab-content active">
            <div className="page-title">एक नज़र में स्थिति</div>
            <p className="subtext">नीचे पूरी योजना की जीवंत स्थिति है। कोई भी संख्या लाल दिखे तो उसी टैब में जाकर जाँच करें।</p>

            <div className="summary-grid">
              <div className="summary-card green">
                <div className="label">कुल क्रय राशि</div>
                <div className="value">₹22,43,295.00</div>
                <div className="sub">सभी 10 किस्में</div>
              </div>
              <div className="summary-card">
                <div className="label">किसानों को वितरित</div>
                <div className="value">0.00 ग्राम</div>
                <div className="sub">0 प्रविष्टियाँ</div>
              </div>
              <div className="summary-card orange">
                <div className="label">केन्द्रों में शेष</div>
                <div className="value">39,630.00 ग्राम</div>
                <div className="sub">प्राप्त 39,630 ग्राम में से</div>
              </div>
              <div className="summary-card red">
                <div className="label">ध्यान देने योग्य</div>
                <div className="value">0</div>
                <div className="sub">0 अधिक-वितरण, 0 हस्ताक्षर बाकी</div>
              </div>
            </div>

            <div className="info-box">
              <h3>ज़रूरी जाँच</h3>
              <ul className="check-list">
                <li>✔ किसी भी केन्द्र में स्टॉक से अधिक वितरण नहीं हुआ।</li>
                <li>✔ सभी प्रविष्टियों में दोनों हस्ताक्षर पूर्ण हैं।</li>
                <li>✔ सभी 10 किस्मों का मानक ₹60,000/हे0 से पूरा मेल खाता है।</li>
                <li>✔ किसी किस्म का आवंटन उसकी खरीदी मात्रा से अधिक नहीं है।</li>
                <li>✔ कुल राजसहायता ₹0.00 + कृषक अंश ₹0.00 = कुल परियोजना निवेश ₹0.00 — मिलान सही।</li>
              </ul>
            </div>

            <div className="info-box">
              <h3>काम का क्रम — बस इतना ही</h3>
              <ol>
                <li><strong>मानक टैब</strong> — एक बार जाँच लें कि हर किस्म का कुल ₹60,000/हे0 (राजसहायता ₹30,000 + कृषक अंश ₹30,000) से मेल खाता है। सब हरा है तो कुछ करने की ज़रूरत नहीं।</li>
                <li><strong>स्टॉक टैब</strong> — बीज की खरीद और केन्द्रों को आवंटन यहीं दर्ज होता है। दोनों पहले से भरे हुए हैं; नई खरीद/आवंटन आने पर ही छूएँ।</li>
                <li><strong>वितरण टैब</strong> — रोज़ का असली काम। केन्द्र, किस्म, किसान का नाम और क्षेत्रफल भरें — बाक़ी सब अपने आप।</li>
                <li><strong>रिपोर्ट टैब</strong> — छपाई व CSV। छपी प्रति पर हस्ताक्षर करवाकर फाइल में लगाएँ।</li>
              </ol>
            </div>
          </div>
        )}

        {/* Distribution Tab */}
        {activeTab === 'distribution' && (
          <div className="tab-content active">
            <div className="page-title">वितरण विवरण</div>
            <div className="actions">
              <button className="btn">नया वितरण जोड़ें</button>
            </div>
            <div className="info-box">
              <h3>वितरण सूची</h3>
              <table>
                <thead>
                  <tr>
                    <th>क्रमांक</th>
                    <th>केन्द्र</th>
                    <th>किस्म</th>
                    <th>किसान का नाम</th>
                    <th>क्षेत्रफल (हे0)</th>
                    <th>मात्रा (ग्राम)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colSpan="6" style={{textAlign: 'center', color: '#94a3b8'}}>अभी तक कोई वितरण प्रविष्टि नहीं है।</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Tab */}
        {activeTab === 'stock' && (
          <div className="tab-content active">
            <div className="page-title">स्टॉक एवं आवंटन विवरण</div>
            <div className="actions">
              <button className="btn">नई खरीद दर्ज करें</button>
              <button className="btn secondary">केन्द्रों को आवंटन करें</button>
            </div>
            <div className="info-box">
              <h3>वर्तमान स्टॉक स्थिति</h3>
              <table>
                <thead>
                  <tr>
                    <th>किस्म का नाम</th>
                    <th>कुल खरीदी (ग्राम)</th>
                    <th>केन्द्रों को आवंटन (ग्राम)</th>
                    <th>शेष स्टॉक (ग्राम)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>कुल मिलाकर</td>
                    <td>39,630.00</td>
                    <td>39,630.00</td>
                    <td>0.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Standard Tab */}
        {activeTab === 'standard' && (
          <div className="tab-content active">
            <div className="page-title">मानक एवं वित्तीय अनुपालन</div>
            <div className="info-box">
              <h3>मानक जाँच प्रणाली</h3>
              <p>हर किस्म का कुल मानक ₹60,000/हे0 (राजसहायता ₹30,000 + कृषक अंश ₹30,000) से पूरा मेल खाता है।</p>
              <table>
                <thead>
                  <tr>
                    <th>किस्म क्रमांक</th>
                    <th>मानक राशि (₹/हे0)</th>
                    <th>राजसहायता (₹)</th>
                    <th>कृषक अंश (₹)</th>
                    <th>स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1 से 10 (सभी किस्में)</td><td>60,000</td><td>30,000</td><td>30,000</td><td><span className="badge paid">मानक पूर्ण</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="tab-content active">
            <div className="page-title">रिपोर्ट एवं प्रिंट</div>
            <div className="actions">
              <button className="btn">प्रिंट करें</button>
              <button className="btn secondary">CSV डाउनलोड करें</button>
            </div>
            <div className="info-box">
              <h3>निर्यात विकल्प</h3>
              <p>यहाँ से आप छपाई हेतु प्रति डाउनलोड कर सकते हैं और CSV फ़ाइल निर्यात कर सकते हैं। छपी प्रति पर हस्ताक्षर करवाकर फाइल में लगाएँ।</p>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        © 2025 बीज वितरण प्रबंधन प्रणाली। सर्वाधिकार सुरक्षित।
      </footer>
    </div>
  );
};

export default SeedFarmers;