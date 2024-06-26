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
  const storedProduct =
    sessionStorage.getItem("selectedProduct") || "Hindu Tamil Thisai";
  const storedStatus = sessionStorage.getItem("selectedStatus") || "";

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
    status: storedStatus,
  });

  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState(storedLayout ? [storedLayout] : []);
  const [zones, setZones] = useState(storedZone ? [storedZone] : []);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [statuses, setStatuses] = useState([]);
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
        console.log('userData',response.data)
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsersData();
  }, []);

  useEffect(() => {
    const fetchAssignValue = async () => {
      try {
        const emp_id = sessionStorage.getItem("emp_id");
        if (usersData && emp_id) {
          const user = usersData.find(user => user.User_ID === emp_id);
          if (user) {
            // If user found, set FetchAssignValue in sessionStorage
            sessionStorage.setItem("FetchAssignValue", user.User_name);
          } else {
            console.error(`User with emp_id ${emp_id} not found in userData.`);
          }
        } else {
          console.error("Either usersData is not available or emp_id is missing.");
        }
      } catch (error) {
        console.error("Error fetching and setting FetchAssignValue:", error);
      }
    };
  
    fetchAssignValue();
  }, [usersData]);
  
  
const FetchAssignValue = sessionStorage.getItem("FetchAssignValue");

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
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
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
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
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
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
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
    setNews([]);
    setFilteredNews([]);
    setStatuses([]);
  };

  const handleStatusChange = (e) => {
    const selectedStatus = e.target.value;
    sessionStorage.setItem("selectedStatus", selectedStatus);
    setFormData({ ...formData, status: selectedStatus });

    if (selectedStatus) {
      const filteredArticles = news.filter(
        (article) => article.Status === selectedStatus
      );
      setFilteredNews(filteredArticles);
    } else {
      setFilteredNews(news);
    }
  };

  const handleShowAssignedOnlyChange = (e) => {
  const checked = e.target.checked;
  setShowAssignedOnly(checked);

  if (checked) {
    // Filter news to show only articles assigned to emp_name
    const filteredArticles = news.filter(
      (article) => article.Assigned_USER === FetchAssignValue
    );
    setFilteredNews(filteredArticles);
  } else {
    // Reset filteredNews to show all news
    setFilteredNews(news);
  }
};


  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/fetchnews`,
        formData
      );
      const fetchedNews = response.data;
      console.log(response.data);
      setNews(fetchedNews);
      setFilteredNews(fetchedNews);
      const fetchedStatuses = [
        ...new Set(fetchedNews.map((article) => article.Status)),
      ];
      setStatuses(fetchedStatuses);
      setShowAssignedOnly(false);

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
    { stage: "Saved", status: "F" },
  ].reduce((acc, item) => {
    acc[item.status] = item.stage;
    return acc;
  }, {});

  const getStatusStage = (status) => statusMap[status] || status;

  const newsLength = filteredNews.length;

    const canEdit = (userRole, status) => {
    if(userRole === "RPT" && (status ==="P" || status ==="S"|| status ==="D" || status ==="A") ) return false;
    if (userRole === "RPT" && status === "F") return true; // Only RPT can edit when status is "F"
    if (userRole === "RPT" && status === "T") return true; // RPT can edit when status is "T"

    if(userRole === "CHRPT" && (status ==="S"|| status ==="D" || status ==="A") ) return false;
    if (userRole === "CHRPT" && status === "F") return false;
    if (userRole === "CHRPT" && status === "T") return true;
    if (userRole === "CHRPT" && status === "P") return true;

    if(userRole === "SPSUBEDT" && (status ==="T"|| status ==="P" || status ==="A") ) return false;
    if (userRole === "SPSUBEDT" && status === "F") return false;
    if (userRole === "SPSUBEDT" && status === "S") return true;
    if (userRole === "SPSUBEDT" && status === "D") return true;

    if(userRole === "SPEDT" && (status ==="T"|| status ==="A") ) return false;
    if (userRole === "SPEDT" && status === "F") return false;
    if (userRole === "SPEDT" && status === "P") return true;
    if (userRole === "SPEDT" && status === "S") return true;
    if (userRole === "SPEDT" && status === "D") return true;

    if(userRole === "SUP" && (status ==="T"|| status ==="S") ) return true;
    if (userRole === "SUP" && status === "F") return true;
    if (userRole === "SUP" && status === "P") return true;
    if (userRole === "SUP" && status === "D") return true;
    if (userRole === "SUP" && status === "A") return false;

    return false;
  };

  return (
    <div className="main-content">
      <div>
        <fieldset className="fieldset">
          <legend>Stories List</legend>
          <Row className="mb-3">
            <Col sm={3} className="mb-3">
              <Form.Group>
                <Form.Control
                  type="date"
                  value={formData.selectedDate}
                  onChange={handleDateChange}
                />
              </Form.Group>
            </Col>

            <Col sm={3} className="mb-3">
              <Form.Select
                aria-label="Product select example"
                onChange={handleProductChange}
                value={formData.product}
              >
                <option>Select Product</option>
                {products.map((productName, index) => (
                  <option key={index} value={productName}>
                    {productName}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col sm={3} className="mb-3">
              <Form.Select
                aria-label="Zone select example"
                onChange={handleZoneChange}
                value={formData.zone}
              >
                <option value="">Zone</option>
                {zones.map((zoneName, index) => (
                  <option key={index} value={zoneName}>
                    {zoneName}
                  </option>
                ))}
              </Form.Select>
            </Col>
          
            <Col sm={3} className="mb-3">
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
            </Row>

          <Row className="mb-3">
            

            <Col sm={3} className="mb-3">
              <Form.Select
                aria-label="Status select example"
                onChange={handleStatusChange}
                value={formData.status}
              >
                <option value="">Select Status</option>
                {statuses.map((status, index) => (
                  <option key={index} value={status}>
                    {getStatusStage(status)}
                  </option>
                ))}
              </Form.Select>
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
          </Row>
          <Button onClick={handleSubmit} style={{ backgroundColor: "#015BAB" }}>
            View
          </Button>
        </fieldset>

        <fieldset className="fieldset">
          <legend>Stories Details</legend>

          <div className="S-heading">Total Stories: {newsLength}</div>

          <div className="table-responsive">
            <Table striped bordered hover responsive="md">
              <thead>
                <tr>
                  <th className="ST-heading">Heading</th>
                  <th>Created</th>
                  <th>Assigned To</th>
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
                {filteredNews.length > 0 ? (
                  filteredNews.map((article, index) => (
                    <tr key={index}>
                      <td className="ST-content">{article.Head}</td>
                      <td>{getUserName(article.Created_user)}</td>
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
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            articleView(
                              article.parent_object_id,
                              article.IssueDate,
                              "view"
                            )
                          }
                        >
                          View
                        </Button>{" "}
                        {canEdit(userRole, article.Status) && (
                          <Button
                            variant="warning"
                            size="sm"
                            onClick={() =>
                              articleView(
                                article.parent_object_id,
                                article.IssueDate
                              )
                            }
                          >
                            Edit
                          </Button>
                        )}{" "}
                        {/* <Button variant="danger" size="sm">Delete</Button> */}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center">
                      No Articles Found
                    </td>
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

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Container, Form, Row, Col, Button, Table } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import "../Styles/ArticleEditor.css";

// export default function ArticleView() {
//   const navigate = useNavigate();

//   const getTodayDate = () => {
//     const today = new Date();
//     const yyyy = today.getFullYear();
//     const mm = String(today.getMonth() + 1).padStart(2, "0");
//     const dd = String(today.getDate() + 1).padStart(2, "0");
//     return `${yyyy}-${mm}-${dd}`;
//   };

//   const emp_id = sessionStorage.getItem("emp_id");
//   const storedZone = sessionStorage.getItem("selectedZone") || "";
//   const storedLayout = sessionStorage.getItem("selectedLayout") || "";
//   const storedDate = sessionStorage.getItem("selectedDate") || getTodayDate();
//   const storedProduct = sessionStorage.getItem("selectedProduct") || "Hindu Tamil Thisai";

//   const getDetail = async () => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_IPCONFIG}api/getUser`,
//         { User_Id: emp_id }
//       );
//       const user = response.data;

//       if (user.GROUP_CODE) {
//         sessionStorage.setItem("userRole", user.GROUP_CODE);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     if (emp_id) {
//       getDetail();
//     } else {
//       navigate("/");
//     }
//   }, [emp_id, navigate]);

//   const [formData, setFormData] = useState({
//     product: storedProduct,
//     layout: storedLayout,
//     zone: storedZone,
//     pagename: "",
//     selectedDate: storedDate,
//   });

//   const [products, setProducts] = useState([]);
//   const [layouts, setLayouts] = useState(storedLayout ? [storedLayout] : []);
//   const [zones, setZones] = useState(storedZone ? [storedZone] : []);
//   const [assignUsers, setAssignUsers] = useState([]);
//   const [pageNames, setPageNames] = useState([]);
//   const [news, setNews] = useState([]);
//   const [usersData, setUsersData] = useState([]);

//   const userRole = sessionStorage.getItem("userRole");
//   // console.log('userRole', userRole);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_IPCONFIG}api/getproducts`
//         );
//         setProducts(response.data.map((product) => product.Product_Name));
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     const fetchZones = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_IPCONFIG}api/getzone`
//         );
//         setZones(response.data.map((zone) => zone.Zone_Name));
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchProducts();
//     fetchZones();
//   }, []);

//   useEffect(() => {
//     const fetchUsersData = async () => {
//       try {
//         const response = await axios.get(
//           `${process.env.REACT_APP_IPCONFIG}api/article/articleuserids`
//         );
//         setUsersData(response.data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     fetchUsersData();
//   }, []);

//   useEffect(() => {
//     const fetchLayouts = async () => {
//       try {
//         const response = await axios.post(
//           `${process.env.REACT_APP_IPCONFIG}api/getlayouts`,
//           { productName: formData.product }
//         );
//         setLayouts(response.data);
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     if (formData.product) {
//       fetchLayouts();
//     }
//   }, [formData.product]);

//   useEffect(() => {
//     const fetchPageNames = async () => {
//       try {
//         const response = await axios.post(
//           `${process.env.REACT_APP_IPCONFIG}api/pagenumber`,
//           { deskName: formData.layout }
//         );
//         setPageNames(response.data.map((page) => page.page_id));
//       } catch (error) {
//         console.error(error);
//       }
//     };

//     if (formData.layout) {
//       fetchPageNames();
//     }
//   }, [formData.layout]);

//   const handleProductChange = async (e) => {
//     const selectedProduct = e.target.value;
//     sessionStorage.setItem("selectedProduct", selectedProduct);
//     setFormData({
//       ...formData,
//       product: selectedProduct,
//       layout: "",
//       pagename: "",
//     });
//     setNews("");
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_IPCONFIG}api/getlayouts`,
//         { productName: selectedProduct }
//       );
//       setLayouts(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleZoneChange = async (e) => {
//     const selectedZone = e.target.value;
//     sessionStorage.setItem("selectedZone", selectedZone);
//     console.log(selectedZone);

//     setFormData({ ...formData, zone: selectedZone });
//     setNews("");
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_IPCONFIG}api/assignuser`,
//         { zoneName: selectedZone }
//       );
//       setAssignUsers(response.data.map((user) => user.User_name));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleLayoutChange = async (e) => {
//     const selectedLayout = e.target.value;
//     sessionStorage.setItem("selectedLayout", selectedLayout);
//     setFormData({ ...formData, layout: selectedLayout, pagename: "" });
//     setNews("");
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_IPCONFIG}api/pagenumber`,
//         { deskName: selectedLayout }
//       );
//       setPageNames(response.data.map((page) => page.page_id));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleDateChange = (e) => {
//     const selectedDate = e.target.value;
//     sessionStorage.setItem("selectedDate", selectedDate);
//     setFormData({ ...formData, selectedDate });
//     setNews("");
//   };

//   const handleSubmit = async () => {
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_IPCONFIG}api/fetchnews`,
//         formData
//       );
//       setNews(response.data);
//       console.log(response.data);
//     } catch (error) {
//       console.error("Error fetching news", error);
//     }
//   };

//   const articleView = (articleId, articleIssueDate, view) => {
//     try {
//       console.log(articleId);
//       navigate(`/article-editor/${articleId}/${articleIssueDate}`, {
//         state: { view },
//       });
//     } catch (error) {
//       console.error("Error navigating to article view", error);
//     }
//   };

//   const userMap = usersData.reduce((acc, user) => {
//     acc[user.User_ID] = user.User_name;
//     return acc;
//   }, {});

//   const getUserName = (userId) => userMap[userId] || userId;

//   const statusMap = [
//     { stage: "Submit", status: "T" },
//     { stage: "Approved", status: "P" },
//     { stage: "Assigned", status: "S" },
//     { stage: "PR Done", status: "D" },
//     { stage: "Finalize", status: "A" },
//     { stage: "Saved", status: "F"},
//   ].reduce((acc, item) => {
//     acc[item.status] = item.stage;
//     return acc;
//   }, {});

//   const getStatusStage = (status) => statusMap[status] || status;

//   const newsLength = news.length;

//   const canEdit = (userRole, status) => {
//     if(userRole === "RPT" && (status ==="P" || status ==="S"|| status ==="D" || status ==="A") ) return false;
//     if (userRole === "RPT" && status === "F") return true; // Only RPT can edit when status is "F"
//     if (userRole === "RPT" && status === "T") return true; // RPT can edit when status is "T"

//     if(userRole === "CHRPT" && (status ==="S"|| status ==="D" || status ==="A") ) return false;
//     if (userRole === "CHRPT" && status === "F") return false;
//     if (userRole === "CHRPT" && status === "T") return true;
//     if (userRole === "CHRPT" && status === "P") return true;

//     if(userRole === "SPSUBEDT" && (status ==="T"|| status ==="P" || status ==="A") ) return false;
//     if (userRole === "SPSUBEDT" && status === "F") return false;
//     if (userRole === "SPSUBEDT" && status === "S") return true;
//     if (userRole === "SPSUBEDT" && status === "D") return true;

//     if(userRole === "SPEDT" && (status ==="T"|| status ==="A") ) return false;
//     if (userRole === "SPEDT" && status === "F") return false;
//     if (userRole === "SPEDT" && status === "P") return true;
//     if (userRole === "SPEDT" && status === "S") return true;
//     if (userRole === "SPEDT" && status === "D") return true;

//     if(userRole === "SUP" && (status ==="T"|| status ==="S") ) return true;
//     if (userRole === "SUP" && status === "F") return true;
//     if (userRole === "SUP" && status === "P") return true;
//     if (userRole === "SUP" && status === "D") return true;
//     if (userRole === "SUP" && status === "A") return false;

//     return false;
//   };

//   return (
//     <div className="main-content">
//       <div>
//         <fieldset className="fieldset">
//           <legend>Stories List</legend>
//           <Row className="mb-3">
//             <Col sm={4} className="mb-3">
//               <Form.Group>
//                 <Form.Control
//                   type="date"
//                   value={formData.selectedDate}
//                   onChange={handleDateChange}
//                 />
//               </Form.Group>
//             </Col>

//             <Col sm={4} className="mb-3">
//               <Form.Select
//                 aria-label="Product select example"
//                 onChange={handleProductChange}
//                 value={formData.product}
//               >
//                 <option>Select Product</option>
//                 {products.map((productName, index) => (
//                   <option key={index} value={productName}>
//                     {productName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>
//             <Col sm={4} className="mb-3">
//               <Form.Select
//                 aria-label="Zone select example"
//                 onChange={handleZoneChange}
//                 value={formData.zone}
//               >
//                 <option value="">Zone</option>
//                 {zones.map((zoneName, index) => (
//                   <option key={index} value={zoneName}>
//                     {zoneName}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>
//           </Row>

//           <Row className="mb-3">
//             <Col sm={4} className="mb-3">
//               <Form.Select
//                 aria-label="Layout desk select example"
//                 onChange={handleLayoutChange}
//                 value={formData.layout}
//               >
//                 <option>No Layout selected</option>
//                 {layouts.map((layout, index) => (
//                   <option key={index} value={layout.desk_name}>
//                     {layout.desk_name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col>

//             {/* <Col sm={4}>
//               <Form.Select
//                 aria-label="Page Name select example"
//                 value={formData.pagename}
//                 onChange={(e) => setFormData({ ...formData, pagename: e.target.value })}
//               >
//                 <option>Page Name</option>
//                 {pageNames.map((page, index) => (
//                   <option key={index} value={page}>
//                     {page}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Col> */}
//           </Row>
//           <Button onClick={handleSubmit} style={{ backgroundColor: "#015BAB" }}>
//             View
//           </Button>
//         </fieldset>

//         <fieldset className="fieldset">
//           <legend>Stories Details</legend>

//           <div className="S-heading">Total Stories: {newsLength}</div>

//           <div className="table-responsive">
//             <Table striped bordered hover responsive="md">
//               <thead>
//                 <tr>
//                   <th className="ST-heading">Heading</th>
//                   <th>Created</th>
//                   <th>Assigned To</th>
//                   <th>Reporter</th>
//                   <th>Ch.Reporter</th>
//                   <th>Sub Editor</th>
//                   <th>SP Sub Editor</th>
//                   <th>Editor</th>
//                   <th>SP Editor</th>
//                   <th>Page</th>
//                   <th>Status</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {news.length > 0 ? (
//                   news.map((article, index) => (
//                     <tr key={index}>
//                       <td className="ST-content">{article.Head}</td>
//                       <td>{getUserName(article.Created_user)}</td>
//                       <td>{getUserName(article.Assigned_USER)}</td>
//                       <td>{getUserName(article.Report_User)}</td>
//                       <td>{getUserName(article.Chief_Report_User)}</td>
//                       <td>{getUserName(article.Sub_Editorial_User)}</td>
//                       <td>{getUserName(article.SP_Sub_Editor)}</td>
//                       <td>{getUserName(article.Editorial_User)}</td>
//                       <td>{getUserName(article.SP_Editor)}</td>
//                       <td>{article.Page_name}</td>
//                       <td>{getStatusStage(article.Status)}</td>
//                       <td>
//                         <Button
//                           variant="primary"
//                           size="sm"
//                           onClick={() =>
//                             articleView(
//                               article.parent_object_id,
//                               article.IssueDate,
//                               "view"
//                             )
//                           }
//                         >
//                           View
//                         </Button>{" "}
//                         {canEdit(userRole, article.Status) && (
//                           <Button
//                             variant="warning"
//                             size="sm"
//                             onClick={() =>
//                               articleView(
//                                 article.parent_object_id,
//                                 article.IssueDate
//                               )
//                             }
//                           >
//                             Edit
//                           </Button>
//                         )}{" "}
//                         {/* <Button variant="danger" size="sm">Delete</Button> */}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="10" className="text-center">
//                       No Articles Found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </Table>
//           </div>
//         </fieldset>
//       </div>
//     </div>
//   );
// }
