import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Form, Row, Col, Button, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../Styles/ArticleEditor.css";

export default function ArticleView() {
  const navigate = useNavigate();
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate() + 1).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const emp_id = sessionStorage.getItem("emp_id");
  const emp_name = sessionStorage.getItem("emp_name");
  const storedZone = sessionStorage.getItem("selectedZone") || "";
  const storedLayout = sessionStorage.getItem("selectedLayout") || "";
  const storedDate = sessionStorage.getItem("selectedDate") || getTodayDate();
  const storedProduct = sessionStorage.getItem("selectedProduct") || "Hindu Tamil Thisai";

  const getDetail = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/getUser`,
        { User_Id: emp_id }
      );
      const user = response.data;

      if (user.GROUP_CODE) {
        sessionStorage.setItem("userRole", user.GROUP_CODE);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (emp_id) {
      getDetail();
    } else {
      navigate("/");
    }
  }, [emp_id, navigate]);

  const [formData, setFormData] = useState({
    product: storedProduct,
    layout: storedLayout,
    zone: storedZone,
    pagename: "",
    selectedDate: storedDate,
    status: "",
  });

  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState(storedLayout ? [storedLayout] : []);
  const [zones, setZones] = useState(storedZone ? [storedZone] : []);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [showAssignedOnly, setShowAssignedOnly] = useState(false);

  const userRole = sessionStorage.getItem("userRole");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/getproducts`
        );
        setProducts(response.data.map((product) => product.Product_Name));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchZones = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/getzone`
        );
        setZones(response.data.map((zone) => zone.Zone_Name));
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
        const response = await axios.get(
          `${process.env.REACT_APP_IPCONFIG}api/article/articleuserids`
        );
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
        const response = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/getlayouts`,
          { productName: formData.product }
        );
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
        const response = await axios.post(
          `${process.env.REACT_APP_IPCONFIG}api/pagenumber`,
          { deskName: formData.layout }
        );
        setPageNames(response.data.map((page) => page.page_id));
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
    sessionStorage.setItem("selectedProduct", selectedProduct);
    setFormData({
      ...formData,
      product: selectedProduct,
      layout: "",
      pagename: "",
    });
    setNews("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/getlayouts`,
        { productName: selectedProduct }
      );
      setLayouts(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleZoneChange = async (e) => {
    const selectedZone = e.target.value;
    sessionStorage.setItem("selectedZone", selectedZone);
    setFormData({ ...formData, zone: selectedZone });
    setNews("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/assignuser`,
        { zoneName: selectedZone }
      );
      setAssignUsers(response.data.map((user) => user.User_name));
    } catch (error) {
      console.error(error);
    }
  };

  const handleLayoutChange = async (e) => {
    const selectedLayout = e.target.value;
    sessionStorage.setItem("selectedLayout", selectedLayout);
    setFormData({ ...formData, layout: selectedLayout, pagename: "" });
    setNews("");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/pagenumber`,
        { deskName: selectedLayout }
      );
      setPageNames(response.data.map((page) => page.page_id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    sessionStorage.setItem("selectedDate", selectedDate);
    setFormData({ ...formData, selectedDate });
    setNews("");
  };

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    setFormData({ ...formData, status: selectedStatus });
    const filtered = news.filter((article) => article.Status === selectedStatus);
    setFilteredNews(filtered);
  };

  const handleShowAssignedOnlyChange = (e) => {
    const checked = e.target.checked;
    setShowAssignedOnly(checked);
    const filtered = checked
      ? news.filter((article) => article.Assigned_USER === emp_name)
      : news;
    setFilteredNews(filtered);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/fetchnews`,
        formData
      );
      const fetchedNews = response.data;
      setNews(fetchedNews);
      setFilteredNews(fetchedNews);
      const fetchedStatuses = [...new Set(fetchedNews.map((article) => article.Status))];
      setStatuses(fetchedStatuses);
      
      // Reset the status filter
      setFormData((prevFormData) => ({ ...prevFormData, status: "" }));
    } catch (error) {
      console.error("Error fetching news", error);
    }
  };

  const articleView = (articleId, articleIssueDate, view) => {
    try {
      navigate(`/article-editor/${articleId}/${articleIssueDate}`, {
        state: { view },
      });
    } catch (error) {
      console.error("Error navigating to article view", error);
    }
  };

  const userMap = usersData.reduce((acc, user) => {
    acc[user.User_ID] = user.User_name;
    return acc;
  }, {});

  const getUserName = (userId) => userMap[userId] || userId;

  const statusMap = [
    { stage: "Submit", status: "T" },
    { stage: "Approved", status: "P" },
    { stage: "Assigned", status: "S" },
    { stage: "PR Done", status: "D" },
    { stage: "Finalize", status: "A" },
    { stage: "Saved", status: "F"},
  ].reduce((acc, item) => {
    acc[item.status] = item.stage;
    return acc;
  }, {});

  const getStatusStage = (status) => statusMap[status] || status;

  const newsLength = filteredNews.length;

  const canEdit = (userRole, status) => {
    if(userRole === "RPT" && (status ==="P" || status ==="S"|| status ==="D")){
      return true
    }
    else if(userRole === "SubDesk" && (status ==="T" || status ==="S")){
      return true
    }
    return false;
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <h3>Article View</h3>
        </Col>
      </Row>
      <Form>
        <Row>
          <Col>
            <Form.Group controlId="formProduct">
              <Form.Label>Product</Form.Label>
              <Form.Control as="select" value={formData.product} onChange={handleProductChange}>
                <option value="">Select Product</option>
                {products.map((product) => (
                  <option key={product} value={product}>
                    {product}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formLayout">
              <Form.Label>Layout</Form.Label>
              <Form.Control as="select" value={formData.layout} onChange={handleLayoutChange}>
                <option value="">Select Layout</option>
                {layouts.map((layout) => (
                  <option key={layout} value={layout}>
                    {layout}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formZone">
              <Form.Label>Zone</Form.Label>
              <Form.Control as="select" value={formData.zone} onChange={handleZoneChange}>
                <option value="">Select Zone</option>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formDate">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={formData.selectedDate}
                onChange={handleDateChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Control as="select" value={formData.status} onChange={handleStatusChange}>
                <option value="">Select Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="formShowAssignedOnly">
              <Form.Check
                type="checkbox"
                label="Show Assigned Only"
                checked={showAssignedOnly}
                onChange={handleShowAssignedOnlyChange}
              />
            </Form.Group>
          </Col>
          <Col>
            <Button variant="primary" onClick={handleSubmit}>
              Fetch News
            </Button>
          </Col>
        </Row>
      </Form>
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Headline</th>
                <th>Issue Date</th>
                <th>Page No</th>
                <th>Assigned User</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.map((article) => (
                <tr key={article.Id}>
                  <td>{article.Id}</td>
                  <td>{article.HEADLINE}</td>
                  <td>{article.Issue_Date}</td>
                  <td>{article.Page_No}</td>
                  <td>{getUserName(article.Assigned_USER)}</td>
                  <td>{getStatusStage(article.Status)}</td>
                  <td>
                    {canEdit(userRole, article.Status) && (
                      <Button
                        variant="primary"
                        onClick={() => articleView(article.Id, article.Issue_Date, false)}
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      onClick={() => articleView(article.Id, article.Issue_Date, true)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <p>Total Articles: {newsLength}</p>
        </Col>
      </Row>
    </Container>
  );
}
