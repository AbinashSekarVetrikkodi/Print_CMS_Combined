import React, { useState } from 'react';
import { FaBars, FaHome, FaAddressBook, FaUser } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../Styles/Sidebar.css';
import HTTimage from "../Assest/HTTimage.png"


const Sidebar = () => {
  const [show, setShow] = useState(false);
  const location = useLocation();

  const handleToggle = () => setShow(!show);
  const handleClose = () => setShow(false);

  return (
    <>
      <button className="btn-toggle" onClick={handleToggle}>
        <FaBars />
      </button>

      <div className={`sidebar ${show ? 'show' : ''}`}>
        <div className="sidebar-header">
          <img src={HTTimage} alt='htt image'/>
          <button className="btn-close" onClick={handleClose}>&times;</button>
        </div>
        <div className="sidebar-body">
          <nav className="nav flex-column">
            <NavLinkWithActive to="/add-article" onClick={handleClose}>
              <FaHome /> Add Article
            </NavLinkWithActive>
            <NavLinkWithActive to="/article-view" onClick={handleClose}>
              <FaAddressBook /> Article View
            </NavLinkWithActive>
            <NavLinkWithActive to="/profile" onClick={handleClose}>
              <FaUser /> Profile
            </NavLinkWithActive>
            <NavLinkWithActive to="/thumbnail" onClick={handleClose}>
              <FaUser /> Thumbnail
            </NavLinkWithActive>
            <NavLinkWithActive to="/revoke" onClick={handleClose}>
              <FaAddressBook /> Revoke
            </NavLinkWithActive>
          </nav>
        </div>
      </div>
      <div className={`overlay ${show ? 'show' : ''}`} onClick={handleClose}></div>
    </>
  );
};

const NavLinkWithActive = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} onClick={onClick} className={`nav-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  );
};

export default Sidebar;
