import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Form, Row, Col, Button, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../Styles/ArticleEditor.css';

export default function ArticleView() {
  const navigate = useNavigate();

  const emp_id = sessionStorage.getItem('emp_id');

  const getDetail = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getUser`, { User_Id: emp_id });
      const user = response.data;

      if (user.GROUP_CODE) {
        sessionStorage.setItem('userRole', user.GROUP_CODE);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (emp_id) {
      getDetail();
    } else {
      navigate('/');
    }
  }, [emp_id, navigate]);

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()+1).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [formData, setFormData] = useState({
    product: 'Hindu Tamil Thisai',
    layout: '',
    zone: '',
    pagename: '',
    selectedDate: getTodayDate(),
  });

  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [zones, setZones] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);
  const [news, setNews] = useState([]);
  const [usersData, setUsersData] = useState([]);

  const userRole = sessionStorage.getItem('userRole');
  // console.log('userRole', userRole);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getproducts`);
        setProducts(response.data.map(product => product.Product_Name));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchZones = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getzone`);
        setZones(response.data.map(zone => zone.Zone_Name));
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
    fetchZones();
  }, []);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/article/articleuserids`);
        setUsersData(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsersData();
  }, []);

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: formData.product });
        setLayouts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    if (formData.product) {
      fetchLayouts();
    }
  }, [formData.product]);

  useEffect(() => {
    const fetchPageNames = async () => {
      try {
        const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: formData.layout });
        setPageNames(response.data.map(page => page.page_id));
      } catch (error) {
        console.error(error);
      }
    };

    if (formData.layout) {
      fetchPageNames();
    }
  }, [formData.layout]);

  const handleProductChange = async (e) => {
    const selectedProduct = e.target.value;
    setFormData({ ...formData, product: selectedProduct, layout: '', pagename: '' });
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: selectedProduct });
      setLayouts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleZoneChange = async (e) => {
    const selectedZone = e.target.value;
    setFormData({ ...formData, zone: selectedZone });
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: selectedZone });
      setAssignUsers(response.data.map(user => user.User_name));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLayoutChange = async (e) => {
    const selectedLayout = e.target.value;
    setFormData({ ...formData, layout: selectedLayout, pagename: '' });
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: selectedLayout });
      setPageNames(response.data.map(page => page.page_id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setFormData({ ...formData, selectedDate });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/fetchnews`, formData);
      setNews(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching news', error);
    }
  };

  const articleView = (articleId, articleIssueDate) => {
    try {
      navigate(`/article-editor/${articleId}/${articleIssueDate}`);
    } catch (error) {
      console.error('Error navigating to article view', error);
    }
  };

  const userMap = usersData.reduce((acc, user) => {
    acc[user.User_ID] = user.User_name;
    return acc;
  }, {});

  const getUserName = (userId) => userMap[userId] || userId;

  const statusMap = [
    { stage: 'Submit', status: 'T' },
    { stage: 'Approved', status: 'P' },
    { stage: 'Assigned', status: 'S' },
    { stage: 'PR Done', status: 'D' },
    { stage: 'Finalize', status: 'A' },
    { stage: 'Saved', status: 'F' }
  ].reduce((acc, item) => {
    acc[item.status] = item.stage;
    return acc;
  }, {});

  const getStatusStage = (status) => statusMap[status] || status;

  const newsLength = news.length;

  const canEdit = (userRole, status) => {
    if (userRole === 'RPT' && status === 'T' || status === 'F') return true;
    if (userRole === 'CHRPT' && (status === 'T' || status === 'P')) return true;
    if (userRole === 'SPSUBEDT' && status === 'S') return true;
    if (userRole === 'SPEDT' && (status === 'P' || status === 'D')) return true;
    return false;
  };

  return (
    <div className='main-content'>
      <div>
        <fieldset className="fieldset">
          <legend>Stories List</legend>
          <Row className="mb-3">
            <Col sm={4} className="mb-3">
              <Form.Group>
                <Form.Control
                  type="date"
                  value={formData.selectedDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>

            <Col sm={4} className="mb-3">
              <Form.Select aria-label="Product select example" onChange={handleProductChange} value={formData.product}>
                <option>Select Product</option>
                {products.map((productName, index) => (
                  <option key={index} value={productName}>
                    {productName}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={4} className="mb-3">
              <Form.Select
                aria-label="Zone select example"
                onChange={handleZoneChange}
                value={formData.zone}
              >
                <option>Zone</option>
                {zones.map((zoneName, index) => (
                  <option key={index} value={zoneName}>
                    {zoneName}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col sm={4} className="mb-3">
              <Form.Select
                aria-label="Layout desk select example"
                onChange={handleLayoutChange}
                value={formData.layout}
              >
                <option>No Layout selected</option>
                {layouts.map((layout, index) => (
                  <option key={index} value={layout.desk_name}>
                    {layout.desk_name}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col sm={4}>
              <Form.Select
                aria-label="Page Name select example"
                value={formData.pagename}
                onChange={(e) => setFormData({ ...formData, pagename: e.target.value })}
              >
                <option>Page Name</option>
                {pageNames.map((page, index) => (
                  <option key={index} value={page}>
                    {page}
                  </option>
                ))}
              </Form.Select>
            </Col>

            
          </Row>
          <Button onClick={handleSubmit} style={{backgroundColor:'#015BAB'}}>View</Button>
        </fieldset>
        

        <fieldset className="fieldset">
          <legend >Stories Details</legend>

          <div className='S-heading'>
            Total Stories: {newsLength}
          </div>

          <div className="table-responsive">
            <Table striped bordered hover responsive="md">
              <thead>
                <tr>
                  <th className='ST-heading'>Heading</th>
                  <th>Created</th>
                  <th>Assigned</th>
                  <th>Reporter</th>
                  <th>Ch.Reporter</th>
                  <th>Sub Editor</th>
                  <th>SP Sub Editor</th>
                  <th>Editor</th>
                  <th>SP Editor</th>
                  <th>Page</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {news.length > 0 ? news.map((article, index) => (
                  <tr key={index}>
                    <td className='ST-content'>{article.Head}</td>
                    <td>{getUserName(article.ArticleCreatedUser)}</td>
                    <td>{getUserName(article.Assigned_USER)}</td>
                    <td>{getUserName(article.Report_User)}</td>
                    <td>{getUserName(article.Chief_Report_User)}</td>
                    <td>{getUserName(article.Sub_Editorial_User)}</td>
                    <td>{getUserName(article.SP_Sub_Editor)}</td>
                    <td>{getUserName(article.Editorial_User)}</td>
                    <td>{getUserName(article.SP_Editor)}</td>
                    <td>{article.Page_name}</td>
                    <td>{getStatusStage(article.Status)}</td>
                    <td>
                      <Button variant="primary" size="sm" onClick={() => articleView(article.parent_object_id, article.IssueDate)}>View</Button>{' '}
                      {canEdit(userRole, article.Status) && (
                        <Button variant="warning" size="sm" onClick={() => articleView(article.parent_object_id, article.IssueDate)}>Edit</Button>
                      )}
                      {' '}
                      {/* <Button variant="danger" size="sm">Delete</Button> */}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="10" className="text-center">No Articles Found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
