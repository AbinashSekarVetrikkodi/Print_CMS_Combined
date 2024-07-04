import React, { useEffect, useState } from 'react';
import '../Styles/Profile.css';

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    emp_email: '',
    emp_name: '',
    emp_title: '',
    emp_id: ''
  });

  useEffect(() => {
    const emp_email = sessionStorage.getItem('emp_email');
    const emp_name = sessionStorage.getItem('emp_name');
    const emp_title = sessionStorage.getItem('emp_title');
    const emp_id = sessionStorage.getItem('emp_id');

    setProfile({
      emp_email: emp_email || '',
      emp_name: emp_name || '',
      emp_title: emp_title || '',
      emp_id: emp_id || ''
    });
  }, []);

  return (
    <div className='p-body '>
    <div className="p-container">
      <div className="p-profile-card">
        <div className="p-profile-title">Profile Page</div>
        <div className="p-profile-item">
          <strong>Name:</strong> {profile.emp_name}
        </div>
        <div className="p-profile-item">
          <strong>Title:</strong> {profile.emp_title}
        </div>
        <div className="p-profile-item">
          <strong>ID:</strong> {profile.emp_id}
        </div>
        <div className="p-profile-item">
          <strong>Email:</strong> {profile.emp_email}
        </div>
      </div>
    </div>
    </div>
  );
};

export default ProfilePage;
