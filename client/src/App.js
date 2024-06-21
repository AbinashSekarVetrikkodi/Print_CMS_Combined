import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Components/Sidebar';
import ArticleNew from './Components/ArticleNew';
import ArticleView from './Components/ArticleView';
import ArticleEditor from './Components/ArticleEditor';
import Userdata from './Components/Userdata';
import Testing from './Components/testing'
import Login from './Components/Login';
import  axios from 'axios';
import  Thumbnail from './Components/Thumbnail';
import Revoke from './Components/Revoke'



function App() {


 
  return (
    <BrowserRouter>
      <div className="App">
        <Sidebar />
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/add-article' element={<ArticleNew />} />
          <Route path='/article-editor/:articleId/:articleIssueDate' element={<ArticleEditor />} />
          <Route path='/article-view' element={<ArticleView />} />
          <Route path='/user' element={<Userdata />} />
          <Route path='/test' element={<Testing />} />
          <Route path='/thumbnail' element={<Thumbnail />} />
          <Route path='/revoke' element={<Revoke />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
