import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Button, Container } from 'react-bootstrap';

const HomePage = () => {
  const navigate = useNavigate();

  // Check session storage for emp_email
  const empEmail = sessionStorage.getItem('emp_email');

  useEffect(() => {
    if (empEmail) {
      navigate('/article-view'); // Navigate to article-view if empEmail is present
    }
  }, [empEmail, navigate]);

  const adAuth = async () => {
    const url = `${process.env.REACT_APP_IPCONFIG}user`;
    const base64EncodedUrl = btoa(url);
    window.location.href = `https://auth.kslmedia.in/index.php?return=${base64EncodedUrl}`;
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Button variant="primary" onClick={adAuth}>
        Login
      </Button>
    </Container>
  );
};

export default HomePage;
