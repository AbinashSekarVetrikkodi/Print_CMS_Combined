import React from 'react';
import '../Styles/Storyassign.css'
import '../Styles/Thumbnail.css'


const Storyassign = () => {
  const iframeStyle = {
    // width: '100vw',
    // height: '100vh',
    border: 'none'
  };

  return (
   <div className="main-content">
        <div className="iframe-container">
          <iframe
            src="http://172.16.3.159:7156/"
            className="responsive-iframe"
            title="External Content"
          />
        </div>
        </div>
      );
};

export default Storyassign;
