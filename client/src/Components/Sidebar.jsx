import React, { useState } from "react";
import { Offcanvas, Nav, Button } from "react-bootstrap";
import { FaBars, FaHome, FaInfo, FaAddressBook, FaUser } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../Styles/Sidebar.css";
import HTTimage from "../Assest/HTTimage.png";

const Sidebar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();
  const Navigate = useNavigate();

  const handleToggle = () => setShow(!show);
  const handleClose = () => setShow(false);

  const handleLogout = () => {
    sessionStorage.removeItem("emp_name");
    sessionStorage.removeItem("emp_email");
    sessionStorage.removeItem("emp_accesskey");
    sessionStorage.removeItem("emp_id");
    sessionStorage.removeItem("emp_title");
    sessionStorage.removeItem("userRole");
    Navigate("/");
  };

  return (
    <>
      <button className="btn-toggle" onClick={handleToggle}>
        <FaBars />
      </button>

      <div className={`sidebar ${show ? "show" : ""}`}>
        <div className="sidebar-header">
          <img src={HTTimage} alt="htt image" />
          <button className="btn-close" onClick={handleClose}>
            &times;
          </button>
        </div>
        <div className="sidebar-body">
          <nav className="nav flex-column">
            <NavLinkWithActive to="/add-article" onClick={handleClose}>
              <FaHome /> <div className="icon-style">Story Creation</div>
            </NavLinkWithActive>
            <NavLinkWithActive to="/article-view" onClick={handleClose}>
              <FaAddressBook /><div className="icon-style"> Stories List</div>
            </NavLinkWithActive>
            {/* <NavLinkWithActive to="/profile" onClick={handleClose}>
              <FaUser /> <div className="icon-style">Profile</div>
            </NavLinkWithActive> 
            
            <NavLinkWithActive to="/revoke" onClick={handleClose}>
              <FaAddressBook /> <div className="icon-style">Revoke</div>
            </NavLinkWithActive> */}

            <a
              href="http://172.16.3.159:7156/"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link" // Add any necessary class names for styling
            >
              <FaUser /> <div className="icon-style">Story Assign</div>
            </a>

            <NavLinkWithActive to="/thumbnail" onClick={handleClose}>
              <FaUser /> <div className="icon-style">Page Preview</div>
            </NavLinkWithActive>

            <Button className ='btn-logout'onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </div>
      <div
        className={`overlay ${show ? "show" : ""}`}
        onClick={handleClose}
      ></div>
    </>
  );
};

const NavLinkWithActive = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`nav-link ${isActive ? "active" : ""}`}
    >
      {children}
    </Link>
  );
};

export default Sidebar;
