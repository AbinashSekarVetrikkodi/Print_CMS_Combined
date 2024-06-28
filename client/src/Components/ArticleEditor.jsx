import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Form, FloatingLabel, Button, Image } from 'react-bootstrap';
import { BsTrash, BsArrowsFullscreen, BsBackspace } from 'react-icons/bs';
import { ToastContainer, toast } from 'react-toastify';
import "../Styles/ArticleEditor.css";

const ArticleEditor = () => {


  const emp_code = sessionStorage.getItem('emp_id')
  const [role, setRole] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const userRole = sessionStorage.getItem('userRole');
    console.log(userRole);
    setRole(userRole);
  }, []);


  const { articleId, articleIssueDate } = useParams();

  const location = useLocation();
  const { view } = location.state || {};
  console.log("view", view);

  const [article, setArticle] = useState([]);

  const [formData, setFormData] = useState({
    product: '',
    layout: '',
    zone: '',
    storyto: '',
    pagename: '',
    Ref_story_name: '',
    HeadKicker: '',
    Head: '',
    HeadDesk: '',
    Byline: '',
    Dateline: '',
    paragraph: '',
    filenames: '',
    path: '',
    finalCaption: '',
    xml_parent_action: '',
    Status: '',
    ArticleCreatedUser: '',
    Chief_Report_User: '',
    Editorial_User: '',
    Report_User: '',
    xml_name: '',
    IssueDate: '',
    caption: '',
    Sub_Editor_View: '',
    SP_Sub_Editor: '',
    SP_Editor: '',
    Assigned_USER: '',
    approved_datetime: '',
  });
  console.log('form data :', formData);

  const [files, setFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [newCaptions, setNewCaptions] = useState([]);
  const [paragraph, setParagraph] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [zones, setZones] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);




  // Function to format the date as YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const issuedate = formatDate(articleIssueDate);

  const zone_name = async (zoneCode) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/Zone_name_api`, { zoneCode });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  const product_name = async (productCode) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/product_name_api`, { Product_Id: productCode });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch article
        const articleResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/fetchnews/id`, {
          newsid: articleId,
          issuedate: issuedate,
        });
        const articleData = articleResponse.data;
        setArticle(articleData);

        // Fetch products
        const productsResponse = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getproducts`);
        const productsData = productsResponse.data.map(product => product.Product_Name);
        setProducts(productsData);

        // Fetch zones
        const zonesResponse = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getzone`);
        const zonesData = zonesResponse.data.map(zone => zone.Zone_Name);
        setZones(zonesData);

        // Update form data with fetched article data
        const zone_value = await zone_name(articleData[0].Zone_Code);
        const product_value = await product_name(articleData[0].Product);

        setFormData({
          ...formData,
          product: articleData[0].Product ? articleData[0].Product : '',
          layout: articleData[0].desk_type ? articleData[0].desk_type : '',
          zone: articleData[0].Zone_Code ? zone_value : '',
          pagename: articleData[0].Page_name ? articleData[0].Page_name : '',
          Ref_story_name: articleData[0].Ref_story_name ? articleData[0].Ref_story_name : '',
          storyto: articleData[0].Articles_Created,
          HeadKicker: articleData[0].HeadKicker,
          Head: articleData[0].Head,
          HeadDesk: articleData[0].HeadDeck,
          Byline: articleData[0].byline,
          Dateline: articleData[0].dateline,
          paragraph: articleData[0].content ? articleData[0].content : '',
          imagePath: articleData[0].Image_Path ? articleData[0].Image_Path : '',
          xml_parent_action: articleData[0].xml_parent_action ? articleData[0].xml_parent_action : '',
          Status: articleData[0].Status ? articleData[0].Status : '',
          ArticleCreatedUser: articleData[0].ArticleCreatedUser ? articleData[0].ArticleCreatedUser : '',
          Chief_Report_User: articleData[0].Chief_Report_User ? articleData[0].Chief_Report_User : '',
          Editorial_User: articleData[0].Editorial_User ? articleData[0].Editorial_User : '',
          Report_User: articleData[0].Report_User ? articleData[0].Report_User : '',
          xml_name: articleData[0].xml_name ? articleData[0].xml_name : '',
          IssueDate: articleData[0].IssueDate ? formatDate(articleData[0].IssueDate) : '',
          caption: articleData[0].caption ? articleData[0].caption : '',
          // Assigned_USER: articleData[0].Assigned_USER ? articleData[0].Assigned_USER : '',
          SP_Sub_Editor: articleData[0].SP_Sub_Editor ? articleData[0].SP_Sub_Editor : '',
          SP_Editor: articleData[0].SP_Editor ? articleData[0].SP_Editor : '',
          filenames:articleData[0].Image_Name ? articleData[0].Image_Name :'',

        });

        setParagraph(articleData[0].content);
        setWordCount(articleData[0].content.trim().split(/\s+/).length);

        const imageNames = articleData[0].Image_Name ? articleData[0].Image_Name.split('~') : [];
        const imageCaptions = articleData[0].caption ? articleData[0].caption.split('/n') : [];

        setFiles(imageNames);
        setCaptions(imageCaptions);

        // Fetch layouts based on the product
        const layoutsResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: articleData[0].Product });
        setLayouts(layoutsResponse.data);

        // Fetch assign users based on the zone
        const assignUsersResponse = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: zone_value });
        setAssignUsers(assignUsersResponse.data.map(user => user.User_name));

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [articleId, issuedate]);





  const handleProductChange = useCallback(async (e) => {
    const selectedProduct = e.target.value;
    setFormData(prevState => ({ ...prevState, product: selectedProduct }));
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: selectedProduct });
      setLayouts(response.data);
    } catch (error) {
      console.error(error);
    }
  }, []);



  const handleZoneChange = useCallback(async (e) => {
    const selectedZone = e.target.value;
    setFormData(prevState => ({ ...prevState, zone: selectedZone }));
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: selectedZone });
      setAssignUsers(response.data.map(user => user.User_name));
    } catch (error) {
      console.error(error);
    }
  }, []);




  const handleLayoutChange = useCallback(async (e) => {
    const selectedLayout = e.target.value;
    setFormData(prevState => ({ ...prevState, layout: selectedLayout }));
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: selectedLayout });
      setPageNames(response.data.map(page => page.page_id));
    } catch (error) {
      console.error(error);
    }
  }, []);






  const handleParagraphChange = useCallback((e) => {
    const text = e.target.value;
    setParagraph(text);
    setWordCount(text.trim().split(/\s+/).length);
    setFormData(prevState => ({ ...prevState, Paragraph: text }));
  }, []);

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setNewFiles([...newFiles, ...selectedFiles]);
  };


  const handleCaptionChange = (index, caption) => {
    setCaptions(prevCaptions => {
      const newCaptions = [...prevCaptions];
      newCaptions[index] = caption;
      newCaptions.join('/n')
      return newCaptions;

    });

  };


  const handleNewCaptionChange = (index, caption) => {
    setNewCaptions(prevNewCaptions => {
      const updatedNewCaptions = [...prevNewCaptions];
      updatedNewCaptions[index] = caption;
      return updatedNewCaptions;
    });
  };

  const handleImageRemove = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);

    const newCaptions = [...captions];
    newCaptions.splice(index, 1);
    setCaptions(newCaptions);
  };

  const handleImagePreview = useCallback((index) => {

    const fileUrl = `https://reporters.hindutamil.in/ImageSrc/${formData.imagePath}/${files[index]}`
    window.open(fileUrl, '_blank');
  }, [files]);

  const handleClearAll = () => {
    setFiles([]);
    setCaptions([]);
  };


  //--------------  update article   ---------------  
  const uploadImagesAndInsertArticle = useCallback(async (updatedFormData) => {


    // if (newFiles.length > 0) {
    //   const imageFormData = new FormData();
    //   files.forEach((file, index) => {
    //     imageFormData.append('images', file, `${index}.${file.name.substr(file.name.lastIndexOf('.') + 1)}`);
    //   });

    //   try {
    //     const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/uploadImages`, imageFormData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data',
    //       },
    //     });
    //     console.log('Files uploaded successfully', response.data);
    //   } catch (error) {
    //     console.error('Error uploading files', error);
    //   }
    // }

    // let imageNames = {};
    // try {
    //   const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getImageName`);
    //   imageNames = response.data;
    //   console.log("imagename:", imageNames);
    // } catch (error) {
    //   console.error('Error fetching image names', error);
    // }

    // // Extract filenames and path from imageNames
    // const filenames = imageNames.filenames ? imageNames.filenames : '';
    // const path = imageNames.path ? imageNames.path : '';

    // Join captions with the /n symbol
    console.log("update captions value", captions);
    const finalCaption = captions.join('/n');
    console.log("finalCaption value for update:", finalCaption);

    const articleData = {
      ...updatedFormData,
      finalCaption
    };
    console.log("articleData:", articleData);

    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updateArticle`, articleData);
      console.log('Article inserted successfully', response.data);
      alert("Article added successfully!");     
      navigate('/article-view');

    } catch (error) {
      console.error('Error inserting article', error);
    }

  }, [files, captions]);


  const validateForm = () => {
    const { product, zone, layout, Assigned_USER, Head, paragraph } = formData;
    const emptyFields = [];

    if (!product) {
      emptyFields.push("Product");
    }
    if (!zone) {
      emptyFields.push("Zone");
    }
    if (!layout) {
      emptyFields.push("Layout Desk");
    }
    if (!Assigned_USER) {
      emptyFields.push("Story To");
    }
    if (!Head) {
      emptyFields.push("Head");
    }
    if (!paragraph) {
      emptyFields.push("Paragraph");
    }

    if (emptyFields.length > 0) {
      alert(`Please fill in all mandatory fields: ${emptyFields.join(', ')}.`);
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
      };

      setFormData(updatedFormData);
      console.log("save function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'T',
        ArticleCreatedUser: emp_code,
        Report_User: emp_code,

      };

      setFormData(updatedFormData);
      console.log("submit function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  };


  const handleApprove = () => {
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'P',
        Chief_Report_User: emp_code,
        ArticleCreatedUser: emp_code,
      };

      setFormData(updatedFormData);
      console.log("Approve function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }

  }

  const handleAssigned = () => {
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'S',
        ArticleCreatedUser: emp_code,
      };

      setFormData(updatedFormData);
      console.log("Assign function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }


  const handlePrDone = () => {
    if (validateForm()) {
      const updatedFormData = {
        ...formData,
        xml_parent_action: 'Updated',
        Status: 'D',
        SP_Sub_Editor: emp_code,
        ArticleCreatedUser: emp_code,
      };

      setFormData(updatedFormData);
      console.log("Predone function calling");
      uploadImagesAndInsertArticle(updatedFormData);
    }
  }


  const handleFinalize = () => {
    formData.Assigned_USER='None';
    if (validateForm()) {
      const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format the date to 'YYYY-MM-DD HH:MM:SS'

      if (role == 'EDT') {
        console.log("Finalize Edt calling");
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          Editorial_User: emp_code,
          ArticleCreatedUser: emp_code,
          approved_datetime: currentDateTime,
        };
        setFormData(updatedFormData);

        uploadImagesAndInsertArticle(updatedFormData);
      } else if (role == 'SPEDT') {
        console.log("Finalize SPEDT calling");
        const updatedFormData = {
          ...formData,
          xml_parent_action: 'Updated',
          Status: 'A',
          SP_Editor: emp_code,
          ArticleCreatedUser: emp_code,
          approved_datetime: currentDateTime,
        };
        setFormData(updatedFormData);
        uploadImagesAndInsertArticle(updatedFormData);
      }
    }
  };



  const handleClose = () => {
    console.log("Close");
    navigate('/article-view')
  }




  const renderButtons = () => {
    const buttonClasses = "btn-logout";

    switch (role) {
      case 'RPT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleSubmit}>
                Submit
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button className={buttonClasses} onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );

      case 'CHRPT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleApprove}>
                Approve
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );

      case 'SUBEDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button  className={buttonClasses} onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );

      case 'EDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="info" className={buttonClasses} onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="success" className={buttonClasses} onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="success" className={buttonClasses} onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );

      case 'SPSUBEDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="info" className={buttonClasses} onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="warning" className={buttonClasses} onClick={handlePrDone}>
                Pr Done
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="warning" className={buttonClasses} onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>

            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="success" className={buttonClasses} onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );

      case 'SPEDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="info" className={buttonClasses} onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="secondary" className={buttonClasses} onClick={handleAssigned}>
                Assigned
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="warning" className={buttonClasses} onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Button variant="success" className={buttonClasses} onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <div className='main-content'>
      <fieldset className="f_fieldset">
        <legend>Select Details</legend>
        <Row className="mb-3">
          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select aria-label="Product select example" onChange={handleProductChange} value={formData.product} className="form-select-sm custom-select" >
              <option>Select Product</option>
              {products.map((productName, index) => (
                <option key={index} value={productName}>
                  {productName}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select aria-label="Layout desk select example" onChange={handleLayoutChange} value={formData.layout} className="form-select-sm custom-select">
              <option>No Layout selected</option>
              {layouts.map((layout, index) => (
                <option key={index} value={layout.desk_name}>
                  {layout.desk_name}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select aria-label="Zone select example" onChange={handleZoneChange} value={formData.zone} className="form-select-sm custom-select">
              <option>Zone</option>
              {zones.map((zoneName, index) => (
                <option key={index} value={zoneName}>
                  {zoneName}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={12} sm={6} md={2} className="mb-3">
            <Form.Select
              aria-label="Story To select example"
              value={formData.Assigned_USER}
              onChange={(e) => setFormData(prevState => ({ ...prevState, Assigned_USER: e.target.value }))}
              className="form-select-sm custom-select"
            >
              <option>Story To</option>
              {assignUsers.map((user, index) => (
                <option key={index} value={user}>
                  {user}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        <Row className="mb-3">

          {/* <Col xs={12} sm={6} md={3}>
            <Form.Select
              aria-label="Page Name select example"
              value={formData.pagename}
              onChange={(e) => setFormData(prevState => ({ ...prevState, pagename: e.target.value }))}
            >
              <option>Page Name</option>
              {pageNames.map((page, index) => (
                <option key={index} value={page}>
                  {page}
                </option>
              ))}
            </Form.Select>
          </Col> */}
        </Row>

      </fieldset>

      <fieldset className="f_fieldset">
        <legend>Content Details</legend>
        {/* <FloatingLabel controlId="floatingInput" label="Story Name" className="mb-3">
          <Form.Control type="text" placeholder="Story Name" value={formData.Ref_story_name} onChange={(e) => setFormData(prevState => ({ ...prevState, Ref_story_name: e.target.value }))} />
        </FloatingLabel> */}

        <FloatingLabel controlId="floatingPassword" label="Head kicker" className="mb-3">
          <Form.Control type="text" placeholder="Head kicker" value={formData.HeadKicker} onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))} />
        </FloatingLabel>

        <FloatingLabel controlId="floatingHead" label="Head" className="mb-3">
          <Form.Control type="text" placeholder="Head" value={formData.Head} onChange={(e) => setFormData(prevState => ({ ...prevState, Head: e.target.value }))} />
        </FloatingLabel>

        <FloatingLabel controlId="floatingPassword" label="Head desk" className="mb-3">
          <Form.Control type="text" placeholder="Head desk" value={formData.HeadDesk} onChange={(e) => setFormData(prevState => ({ ...prevState, HeadDesk: e.target.value }))} />
        </FloatingLabel>

        <Row className="mb-3">
          <Col md={6}>
            <FloatingLabel controlId="floatingPassword" label="Byline" className="mb-3">
              <Form.Control type="text" placeholder="Byline" value={formData.Byline} onChange={(e) => setFormData(prevState => ({ ...prevState, Byline: e.target.value }))} />
            </FloatingLabel>
          </Col>

          <Col md={6}>
            <FloatingLabel controlId="floatingPassword" label="Dateline" className="mb-3">
              <Form.Control type="text" placeholder="Dateline" value={formData.Dateline} onChange={(e) => setFormData(prevState => ({ ...prevState, Dateline: e.target.value }))} />
            </FloatingLabel>
          </Col>

        </Row>

        <FloatingLabel controlId="floatingTextarea" label="Paragraph" className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Leave a comment here"
            style={{ height: '300px' }}
            value={formData.paragraph}
            onChange={handleParagraphChange}
          />
        </FloatingLabel>

        <div className="mb-3">Word Count: {wordCount}</div>

        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Choose Images</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} accept="image/*" multiple />
        </Form.Group>

        <div>

          {files.map((file, index) => (

            <div key={index} className="mb-3">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <Image src={`https://reporters.hindutamil.in/ImageSrc/${formData.imagePath}/${file}`} alt={`Image ${index + 1}`} style={{ width: '100px', height: 'auto', marginRight: '10px' }} />
                <Form.Control
                  type="text"
                  placeholder={`Enter caption for Image ${index + 1}`}
                  value={captions[index] || ''}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  style={{ flex: '1' }}
                />
                <Button variant="danger" onClick={() => handleImageRemove(index)} style={{ marginLeft: '10px' }}>
                  <BsTrash />
                </Button>
                <Button variant="primary" onClick={() => handleImagePreview(index)} style={{ marginLeft: '10px' }}>
                  <BsArrowsFullscreen />
                </Button>
              </div>
              <div>{file}</div>
            </div>
          ))}

          {newFiles.map((file, index) => (
            <div key={index} className="mb-3">
              <div className="d-flex align-items-center">
                <Image src={URL.createObjectURL(file)} thumbnail style={{ maxWidth: '150px' }} />
                <Form.Control
                  type="text"
                  placeholder="Enter caption"
                  value={newCaptions[index] || ''}
                  onChange={(e) => handleNewCaptionChange(index, e.target.value)}
                  className="ms-2"
                />
                <Button variant="danger" className="ms-2" onClick={() => handleImageRemove(index)}>
                  <BsTrash />
                </Button>
                <Button variant="secondary" className="ms-2">
                  <BsArrowsFullscreen />
                </Button>
              </div>
            </div>
          ))}

        </div>

        {files.length > 0 && (
          <Button variant="secondary" onClick={handleClearAll}>
            Clear All <BsBackspace />
          </Button>
        )}
      </fieldset>


      {
        !view ?
          <>
            {renderButtons()}
          </> : <div>view only</div>
      }


    </div>
  );
};

export default ArticleEditor;


