import React, { useEffect } from "react";
import "./testing.css"
import { Container } from 'react-bootstrap'
import axios from 'axios';



export default function Sidebar() {

    // useEffect(() => {
    //     const returnUrl = 'http://192.168.90.87:3000/article-view';
    //     const encodeUrl = btoa(returnUrl); // Encode the return URL
    //     userdata(returnUrl, encodeUrl);
    //   }, []);
    
    //   const userdata = async (returnUrl, encodeUrl) => {
    //     try {
    //       const response = await axios.post('http://192.168.90.87:3800/redirectToAuth', { returnUrl, encodeUrl });
    //       if (response.data.redirectUrl) {
    //         console.log(response.data);
    //         window.location.href = response.data.redirectUrl; // Navigate to the returned URL
    //       }
    //     } catch (error) {
    //       console.error('Error fetching user data:', error);
    //     }
    //   };

    useEffect(()=>{
        const url = 'http://192.168.90.87:3800/user'
        const base64EncodedUrl = btoa(url); 
        window.location.href = `https://auth.kslmedia.in/index.php?return=${base64EncodedUrl}`;
    })


    return (
        <>
        <Container fluid>
            Hindu Tamil
        </Container>
        </>
    )
}

