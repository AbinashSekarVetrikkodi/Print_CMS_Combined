import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route ,Outlet } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import ArticleNew from './Components/ArticleNew';
import ArticleView from './Components/ArticleView';
import ArticleEditor from './Components/ArticleEditor';
import Userdata from './Components/Userdata';
import Login from './Components/Login';
import  Thumbnail from './Components/Thumbnail';
import Revoke from './Components/Revoke';
import Footer from './Components/Footer';
import Storyassign from './Components/Storyassign';
import ProfilePage from './Components/Profile';

 
 
 
const Layout = () => {
  return (
    <div className="App">
      <Sidebar />
      <Outlet />
    </div>
  );
};
 
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/' element={<Layout />}>
          <Route path='add-article' element={<ArticleNew />} />
          <Route path='article-editor/:articleId/:articleIssueDate' element={<ArticleEditor />} />
          <Route path='article-view' element={<ArticleView />} />
          <Route path='user' element={<Userdata />} />     
          <Route path='storyassign' element={<Storyassign />} />     
          <Route path='thumbnail' element={<Thumbnail />} />
          <Route path='revoke' element={<Revoke />} />
          <Route path='ProfilePage' element={<ProfilePage />} />
        </Route>
      </Routes>     
      <Footer />  
    </BrowserRouter>
  );
};
 
export default App;