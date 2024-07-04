import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function HttAuth() {

  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    // Function to parse query string parameters
    function parseQueryString(queryString) {
      const params = new URLSearchParams(queryString);
      const formDataParam = params.get("formData");
      return formDataParam
        ? JSON.parse(decodeURIComponent(formDataParam))
        : null;
    }


    const formData = parseQueryString(location.search);


    if (formData !== null) {

      // Extract values from formData
      const { ad_name, ad_email,ad_access, ad_emp_id,
        jobTitle} = formData;

      sessionStorage.setItem("emp_name", ad_name);
      sessionStorage.setItem("emp_email", ad_email);
      sessionStorage.setItem("emp_accesskey", ad_access);
      sessionStorage.setItem("emp_id", ad_emp_id);
      sessionStorage.setItem("emp_title", jobTitle);

      
      navigate("/article-view");
    } else {
      console.log("No formData found in the URL.");
      navigate("/");
    }
  }, [location.search]);

  return <div></div>;
}

export default HttAuth;
