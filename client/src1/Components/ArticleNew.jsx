import React, { useState, useEffect, useCallback, } from 'react';
import axios from 'axios';
import { Container, Form, Row, Col, FloatingLabel, Button, Image } from 'react-bootstrap';
import { BsTrash, BsArrowsFullscreen, BsBackspace } from 'react-icons/bs';
import '../Styles/ArticleEditor.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
 
 
 
export default function ArticleNew() {
 
 const navigate = useNavigate();
 
 const emp_code = sessionStorage.getItem('emp_id')
   // Assuming you fetch the user's role from the session or state
   const [role, setRole] = useState('');
 
   useEffect(() => {
     const userRole = sessionStorage.getItem('userRole');
     console.log(userRole);
     setRole(userRole);
   }, []);
 
  const [paragraph, setParagraph] = useState('');
  const [wordCount, setWordCount] = useState(0);
 
  const [formData, setFormData] = useState({
    product: '',
    layout: '',
    zone: '',
    storyto: '',
    pagename: '',
    Storyname: '',
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
    xml_parent_action:'',
    Status:'',
    ArticleCreatedUser:'',
    Chief_Report_User:'',
    Editorial_User:'',
    Report_User:'',
    Assigned_USER:''
  });
 
 console.log("formData values :",formData);
 
  const [products, setProducts] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [zones, setZones] = useState([]);
  const [assignUsers, setAssignUsers] = useState([]);
  const [pageNames, setPageNames] = useState([]);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
 
  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getproducts`);
      setProducts(response.data.map(product => product.Product_Name));
    } catch (error) {
      console.error(error);
    }
  }, []);
 
  const fetchZones = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getzone`);
      setZones(response.data.map(zone => zone.Zone_Name));
    } catch (error) {
      console.error(error);
    }
  }, []);
 
  useEffect(() => {
    fetchProducts();
    fetchZones();
  }, [fetchProducts, fetchZones]);
 
  const handleParagraphChange = useCallback((e) => {
    const text = e.target.value;
    setParagraph(text);
    setWordCount(text.trim().split(/\s+/).length);
    setFormData(prevState => ({ ...prevState, paragraph: text }));
  }, []);
 
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
 
  const handleImageChange = useCallback((e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setCaptions(prevCaptions => [...prevCaptions, ...Array(selectedFiles.length).fill('')]);
  }, []);
 
  const handleCaptionChange = useCallback((index, caption) => {
    setCaptions(prevCaptions => {
      const newCaptions = [...prevCaptions];
      newCaptions[index] = caption;
      return newCaptions;
    });
  }, []);
 
  const handleImageRemove = useCallback((index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setCaptions(prevCaptions => prevCaptions.filter((_, i) => i !== index));
  }, []);
 
  const handleClearAll = useCallback(() => {
    setFiles([]);
    setCaptions([]);
  }, []);
 
  const handleImagePreview = useCallback((index) => {
    const fileUrl = URL.createObjectURL(files[index]);
    window.open(fileUrl, '_blank');
  }, [files]);
 
 
//-------update Article and images-----
 
 
const uploadImagesAndInsertArticle = useCallback(async (updatedFormData) => {
 
  if (files.length > 0) {
    const imageFormData = new FormData();
    files.forEach((file, index) => {
      imageFormData.append('images', file, `${index}.${file.name.substr(file.name.lastIndexOf('.') + 1)}`);
    });
 
    try {
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/uploadImages`, imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Files uploaded successfully', response.data);
    } catch (error) {
      console.error('Error uploading files', error);
    }
  }
 
  let imageNames = {};
  try {
    const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getImageName`);
    imageNames = response.data;
    console.log("imagename:", imageNames);
  } catch (error) {
    console.error('Error fetching image names', error);
  }
 
  // Extract filenames and path from imageNames
  const filenames = imageNames.filenames ? imageNames.filenames : '';
  const path = imageNames.path ? imageNames.path : '';
 
  // Join captions with the /n symbol
  const finalCaption = captions.join('/n');
  console.log("finalCaption value:",finalCaption);
 
  // Update formData with the new values
  updatedFormData = {
    ...updatedFormData,
    filenames,
    path,
    finalCaption
  };
 
  // Create the articleData object
  const articleData = {
    ...updatedFormData,
  };
 
  console.log("articleData:", articleData);
 
  try {
    const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/insertArticle`, articleData);
   
    console.log('Article inserted successfully', response.data);
    toast.success("Article added successfully!");
 
    setTimeout(() => {
      navigate('/article-view');
    }, 6500);
 
 
 
  } catch (error) {
    console.error('Error inserting article', error);
  }
}, [files, captions]);
 
const handleSave = () => {
  const updatedFormData = {
    ...formData,
    xml_parent_action: 'Created',
    Status: 'F',
    ArticleCreatedUser: emp_code,
   
  };
 
  setFormData(updatedFormData);
  console.log("save function calling");
  uploadImagesAndInsertArticle(updatedFormData);
};
 
const handleSubmit = () => {
  const updatedFormData = {
    ...formData,
    xml_parent_action: 'Updated',
    Status: 'T',
    ArticleCreatedUser: emp_code,
    Report_User: emp_code,
    Assigned_USER:emp_code
  };
 
  setFormData(updatedFormData);
  console.log("submit function calling");
  uploadImagesAndInsertArticle(updatedFormData);
};
 
 
 
 
  const handleApprove = () => {
    const updatedFormData = {
      ...formData,
      xml_parent_action: 'Updated',
      Status: 'P',
      Chief_Report_User:emp_code,
      Assigned_USER:emp_code
    };
 
    setFormData(updatedFormData);
    console.log("Approve function calling");
    uploadImagesAndInsertArticle(updatedFormData);
 
  }
 
  const handleAssigned = () => {
    const updatedFormData = {
      ...formData,
      xml_parent_action: 'Updated',
      Status: 'S',
      ArticleCreatedUser: emp_code,
      Report_User: emp_code,
      Chief_Report_User:emp_code,
      Editorial_User:emp_code,
      Assigned_USER:emp_code
    };
 
    setFormData(updatedFormData);
    console.log("Assign function calling");
    uploadImagesAndInsertArticle(updatedFormData);
  }
 
 
  const handlePrDone = () => {
    const updatedFormData = {
      ...formData,
      xml_parent_action: 'Updated',
      Status: 'D',
      ArticleCreatedUser: emp_code,
      Report_User: emp_code,
      Chief_Report_User:emp_code,
      Editorial_User:emp_code,
      Assigned_USER:emp_code
    };
 
    setFormData(updatedFormData);
    console.log("Predone function calling");
    uploadImagesAndInsertArticle(updatedFormData);
  }
 
  const handleFinalize = () => {
    const updatedFormData = {
      ...formData,
      xml_parent_action: 'Updated',
      Status: 'A',
      ArticleCreatedUser: emp_code,
      Report_User: emp_code,
      Chief_Report_User:emp_code,
      Editorial_User:emp_code,
      Assigned_USER:emp_code
    };
 
    setFormData(updatedFormData);
    console.log("Finalize function calling");
    uploadImagesAndInsertArticle(updatedFormData);
  }
 
 
 
 
 
  const handleClose = () => {
    console.log("Close");
    navigate('/article-view')
  }
 
  const renderButtons = () => {
    switch (role) {
      case 'RPT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="primary" size="sm" className="w-100" onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleSubmit}>
                Submit
              </Button>
            </Col>
 
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );
 
      case 'CHRPT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="info" size="sm" className="w-100" onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="warning" size="sm" className="w-100" onClick={handleApprove}>
                Approved
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleClose}>
                Close
              </Button>
            </Col>
 
          </Row>
        );
 
      case 'SUBEDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="info" size="sm" className="w-100" onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="warning" size="sm" className="w-100" onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2" >
              <Button variant="secondary" size="sm" className="w-100" onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );
 
      case 'EDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="info" size="sm" className="w-100" onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );
 
 
 
      case 'SPSUBEDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="info" size="sm" className="w-100" onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="warning" size="sm" className="w-100" onClick={handlePrDone}>
                Pr Done
              </Button>
            </Col>
 
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleClose}>
                Close
              </Button>
            </Col>
          </Row>
        );
 
      case 'SPEDT':
        return (
          <Row className="justify-content-between">
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="info" size="sm" className="w-100" onClick={handleSave}>
                Save
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2" >
              <Button variant="secondary" size="sm" className="w-100" onClick={handleAssigned}>
                Assigned
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="warning" size="sm" className="w-100" onClick={handleFinalize}>
                Finalize
              </Button>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3} className="mb-2">
              <Button variant="success" size="sm" className="w-100" onClick={handleClose}>
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
      <fieldset className="fieldset">
        <legend>Story Editor</legend>
        <Row className="mb-3">
         
 
          <Col xs={12} sm={6} md={3} className="mb-3">
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
 
          <Col xs={12} sm={6} md={3} className="mb-3">
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
 
          <Col xs={12} sm={6} md={3} className="mb-3">
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
 
          <Col xs={12} sm={6} md={3} className="mb-3">
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
          </Col>
 
        </Row>
      </fieldset>
 
      <fieldset className="fieldset">
        <legend>Content Details</legend>
        <FloatingLabel controlId="floatingInput" label="Story Name" className="mb-3">
          <Form.Control type="text" placeholder="Story Name" onChange={(e) => setFormData(prevState => ({ ...prevState, Ref_story_name: e.target.value }))} />
        </FloatingLabel>
 
        <FloatingLabel controlId="floatingPassword" label="Head kicker" className="mb-3">
          <Form.Control type="text" placeholder="Head kicker" onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))} />
        </FloatingLabel>
 
        <FloatingLabel controlId="floatingHead" label="Head" className="mb-3">
          <Form.Control type="text" placeholder="Head" onChange={(e) => setFormData(prevState => ({ ...prevState, Head: e.target.value }))} />
        </FloatingLabel>
 
        <FloatingLabel controlId="floatingPassword" label="Head desk" className="mb-3">
          <Form.Control type="text" placeholder="Head desk" onChange={(e) => setFormData(prevState => ({ ...prevState, HeadDesk: e.target.value }))} />
        </FloatingLabel>
 
        <FloatingLabel controlId="floatingPassword" label="Byline" className="mb-3">
          <Form.Control type="text" placeholder="Byline" onChange={(e) => setFormData(prevState => ({ ...prevState, Byline: e.target.value }))} />
        </FloatingLabel>
 
        <FloatingLabel controlId="floatingPassword" label="Dateline" className="mb-3">
          <Form.Control type="text" placeholder="Dateline" onChange={(e) => setFormData(prevState => ({ ...prevState, Dateline: e.target.value }))} />
        </FloatingLabel>
 
        <FloatingLabel controlId="floatingTextarea" label="Paragraph" className="mb-3">
          <Form.Control
            as="textarea"
            placeholder="Leave a comment here"
            style={{ height: '200px' }}
            value={paragraph}
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
                <Image src={URL.createObjectURL(file)} alt={`Image ${index + 1}`} style={{ width: '100px', height: 'auto', marginRight: '10px' }} />
                <Form.Control
                  type="text"
                  placeholder={`Enter caption for Image ${index + 1}`}
                  value={captions[index]}
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
              <div>{file.name}</div>
            </div>
          ))}
        </div>
 
        {files.length > 0 && (
          <Button variant="secondary" onClick={handleClearAll}>
            Clear All <BsBackspace />
          </Button>
        )}
      </fieldset>
 
      {/* <Button variant="primary" onClick={uploadImagesAndInsertArticle}>
        Upload
      </Button> */}
 
      <fieldset className="fieldset">
        <Container>{renderButtons()}</Container>
        <ToastContainer />
      </fieldset>
    </div>
  );
}

// import React, { useState, useEffect, useCallback, } from 'react';
// import axios from 'axios';
// import { Container, Form, Row, Col, FloatingLabel, Button, Image } from 'react-bootstrap';
// import { BsTrash, BsArrowsFullscreen, BsBackspace } from 'react-icons/bs';
// import '../Styles/ArticleEditor.css';
// import { useNavigate } from 'react-router-dom';

// export default function ArticleNew() {




//   const [paragraph, setParagraph] = useState('');
//   const [wordCount, setWordCount] = useState(0);
//   const [formData, setFormData] = useState({
//     product: '',
//     layout: '',
//     zone: '',
//     storyto: '',
//     pagename: '',
//     Storyname: '',
//     HeadKicker: '',
//     Head: '',
//     HeadDesk: '',
//     Byline: '',
//     Dateline: '',
//     paragraph: '',
//     filenames:'', 
//     path:'',
//     finalCaption:'',
//   });

//   console.log("formData values :" ,formData);

//   const [products, setProducts] = useState([]);
//   const [layouts, setLayouts] = useState([]);
//   const [zones, setZones] = useState([]);
//   const [assignUsers, setAssignUsers] = useState([]);
//   const [pageNames, setPageNames] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [captions, setCaptions] = useState([]);

//   const fetchProducts = useCallback(async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getproducts`);
//       setProducts(response.data.map(product => product.Product_Name));
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   const fetchZones = useCallback(async () => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getzone`);
//       setZones(response.data.map(zone => zone.Zone_Name));
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   useEffect(() => {
//     fetchProducts();
//     fetchZones();
//   }, [fetchProducts, fetchZones]);

//   const handleParagraphChange = useCallback((e) => {
//     const text = e.target.value;
//     setParagraph(text);
//     setWordCount(text.trim().split(/\s+/).length);
//     setFormData(prevState => ({ ...prevState, paragraph: text }));
//   }, []);

//   const handleProductChange = useCallback(async (e) => {
//     const selectedProduct = e.target.value;
//     setFormData(prevState => ({ ...prevState, product: selectedProduct }));
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/getlayouts`, { productName: selectedProduct });
//       setLayouts(response.data);
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   const handleZoneChange = useCallback(async (e) => {
//     const selectedZone = e.target.value;
//     setFormData(prevState => ({ ...prevState, zone: selectedZone }));
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/assignuser`, { zoneName: selectedZone });
//       setAssignUsers(response.data.map(user => user.User_name));
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   const handleLayoutChange = useCallback(async (e) => {
//     const selectedLayout = e.target.value;
//     setFormData(prevState => ({ ...prevState, layout: selectedLayout }));
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pagenumber`, { deskName: selectedLayout });
//       setPageNames(response.data.map(page => page.page_id));
//     } catch (error) {
//       console.error(error);
//     }
//   }, []);

//   const handleImageChange = useCallback((e) => {
//     const selectedFiles = Array.from(e.target.files);
//     setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
//     setCaptions(prevCaptions => [...prevCaptions, ...Array(selectedFiles.length).fill('')]);
//   }, []);

//   const handleCaptionChange = useCallback((index, caption) => {
//     setCaptions(prevCaptions => {
//       const newCaptions = [...prevCaptions];
//       newCaptions[index] = caption;
//       return newCaptions;
//     });
//   }, []);

//   const handleImageRemove = useCallback((index) => {
//     setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
//     setCaptions(prevCaptions => prevCaptions.filter((_, i) => i !== index));
//   }, []);

//   const handleClearAll = useCallback(() => {
//     setFiles([]);
//     setCaptions([]);
//   }, []);

//   const handleImagePreview = useCallback((index) => {
//     const fileUrl = URL.createObjectURL(files[index]);
//     window.open(fileUrl, '_blank');
//   }, [files]);

//   const uploadImagesAndInsertArticle = useCallback(async () => {
//     if (files.length > 0) {
//       const imageFormData = new FormData();
//       files.forEach((file, index) => {
//         imageFormData.append('images', file, `${index}.${file.name.substr(file.name.lastIndexOf('.') + 1)}`);
//       });
  
//       try {
//         const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/uploadImages`, imageFormData, {
//           headers: {
//             'Content-Type': 'multipart/form-data',
//           },
//         });
//         console.log('Files uploaded successfully', response.data);
//       } catch (error) {
//         console.error('Error uploading files', error);
//       }
//     }
  
//     let imageNames = {};
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/getImageName`);
//       imageNames = response.data;
//       console.log("imagename:", imageNames);
//     } catch (error) {
//       console.error('Error fetching image names', error);
//     }
  
//     // Extract filenames and path from imageNames
//     const filenames = imageNames.filenames ? imageNames.filenames : '';
//     const path = imageNames.path ? imageNames.path : '';
  
//     // Join captions with the ~ symbol
//     const finalCaption = captions.join('/n');
  
//     // Update formData with the new values
//     setFormData(prevState => ({
//       ...prevState,
//       filenames,
//       path,
//       finalCaption
//     }));
  
//     // Create the articleData object
//     const articleData = {
//       ...formData,
//       filenames,
//       path,
//       finalCaption
//     };
  
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/insertArticle`, articleData);
//       console.log("articleData:", articleData);
//       console.log('Article inserted successfully', response.data);
//     } catch (error) {
//       console.error('Error inserting article', error);
//     }
//   }, [files, captions, formData]);

//   return (
//     //added css
//     <div className='main-content'> 
//     <Container>
//       <fieldset className="fieldset">
//         <legend>Story Editor</legend>
//         <Row className="mb-3">
//           <Col sm={4} className="mb-3">
//             <Form.Select aria-label="Product select example" onChange={handleProductChange}>
//               <option>Select Product</option>
//               {products.map((productName, index) => (
//                 <option key={index} value={productName}>
//                   {productName}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col sm={4} className="mb-3">
//             <Form.Select
//               aria-label="Layout desk select example"
//               onChange={handleLayoutChange}
//               value={formData.layout}
//             >
//               <option>No Layout selected</option>
//               {layouts.map((layout, index) => (
//                 <option key={index} value={layout.desk_name}>
//                   {layout.desk_name}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col sm={4} className="mb-3">
//             <Form.Select
//               aria-label="Zone select example"
//               onChange={handleZoneChange}
//               value={formData.zone}
//             >
//               <option>Zone</option>
//               {zones.map((zoneName, index) => (
//                 <option key={index} value={zoneName}>
//                   {zoneName}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//         </Row>

//         <Row className="mb-3">
//           <Col sm={4} className="mb-3">
//             <Form.Select
//               aria-label="Story To select example"
//               value={formData.storyto}
//               onChange={(e) => setFormData(prevState => ({ ...prevState, storyto: e.target.value }))}
//             >
//               <option>Story To</option>
//               {assignUsers.map((user, index) => (
//                 <option key={index} value={user}>
//                   {user}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col sm={4}>
//             <Form.Select
//               aria-label="Page Name select example"
//               value={formData.pagename}
//               onChange={(e) => setFormData(prevState => ({ ...prevState, pagename: e.target.value }))}
//             >
//               <option>Page Name</option>
//               {pageNames.map((page, index) => (
//                 <option key={index} value={page}>
//                   {page}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//         </Row>
//       </fieldset>

//       <fieldset className="fieldset">
//         <legend>Content Details</legend>
//         <FloatingLabel controlId="floatingInput" label="Story Name" className="mb-3">
//           <Form.Control type="text" placeholder="Story Name" onChange={(e) => setFormData(prevState => ({ ...prevState, Storyname: e.target.value }))} />
//         </FloatingLabel>

//         <FloatingLabel controlId="floatingPassword" label="Head kicker" className="mb-3">
//           <Form.Control type="text" placeholder="Head kicker" onChange={(e) => setFormData(prevState => ({ ...prevState, HeadKicker: e.target.value }))} />
//         </FloatingLabel>

//         <FloatingLabel controlId="floatingHead" label="Head" className="mb-3">
//           <Form.Control type="text" placeholder="Head" onChange={(e) => setFormData(prevState => ({ ...prevState, Head: e.target.value }))} />
//         </FloatingLabel>

//         <FloatingLabel controlId="floatingPassword" label="Head desk" className="mb-3">
//           <Form.Control type="text" placeholder="Head desk" onChange={(e) => setFormData(prevState => ({ ...prevState, HeadDesk: e.target.value }))} />
//         </FloatingLabel>

//         <FloatingLabel controlId="floatingPassword" label="Byline" className="mb-3">
//           <Form.Control type="text" placeholder="Byline" onChange={(e) => setFormData(prevState => ({ ...prevState, Byline: e.target.value }))} />
//         </FloatingLabel>

//         <FloatingLabel controlId="floatingPassword" label="Dateline" className="mb-3">
//           <Form.Control type="text" placeholder="Dateline" onChange={(e) => setFormData(prevState => ({ ...prevState, Dateline: e.target.value }))} />
//         </FloatingLabel>

//         <FloatingLabel controlId="floatingTextarea" label="Paragraph" className="mb-3">
//           <Form.Control
//             as="textarea"
//             placeholder="Leave a comment here"
//             style={{ height: '200px' }}
//             value={paragraph}
//             onChange={handleParagraphChange}
//           />
//         </FloatingLabel>

//         <div className="mb-3">Word Count: {wordCount}</div>

//         <Form.Group controlId="formFile" className="mb-3">
//           <Form.Label>Choose Images</Form.Label>
//           <Form.Control type="file" onChange={handleImageChange} accept="image/*" multiple />
//         </Form.Group>

//         <div>
//           {files.map((file, index) => (
//             <div key={index} className="mb-3">
//               <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
//                 <Image src={URL.createObjectURL(file)} alt={`Image ${index + 1}`} style={{ width: '100px', height: 'auto', marginRight: '10px' }} />
//                 <Form.Control
//                   type="text"
//                   placeholder={`Enter caption for Image ${index + 1}`}
//                   value={captions[index]}
//                   onChange={(e) => handleCaptionChange(index, e.target.value)}
//                   style={{ flex: '1' }}
//                 />
//                 <Button variant="danger" onClick={() => handleImageRemove(index)} style={{ marginLeft: '10px' }}>
//                   <BsTrash />
//                 </Button>
//                 <Button variant="primary" onClick={() => handleImagePreview(index)} style={{ marginLeft: '10px' }}>
//                   <BsArrowsFullscreen />
//                 </Button>
//               </div>
//               <div>{file.name}</div>
//             </div>
//           ))}
//         </div>

//         {files.length > 0 && (
//           <Button variant="secondary" onClick={handleClearAll}>
//             Clear All <BsBackspace />
//           </Button>
//         )}
//       </fieldset>

//       <Button variant="primary" onClick={uploadImagesAndInsertArticle}>
//         Upload
//       </Button>
//     </Container>
//     </div>
//   );
// }
