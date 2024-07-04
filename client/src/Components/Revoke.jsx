import React, { useState, useEffect } from "react";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import "../Styles/Revoke.css";
import { Modal, Button } from 'react-bootstrap';

const App = () => {
  const getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    return `${year}-${month}-${day}`;
  };

  const initialIssueDate = sessionStorage.getItem("issueDate") || getCurrentDate();
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(sessionStorage.getItem("product") || "TAMILTH");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("");
  const [edition, setEdition] = useState("1");
  const [lastRefreshTime, setLastRefreshTime] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [updateData, setUpdateData] = useState([]);
  const [alertShow, setAlertShow] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmShow, setConfirmShow] = useState(false);

  useEffect(() => {
    updateRefreshTime();
  }, []);

  useEffect(() => {
    if (issueDate) {
      fetchProductIds(issueDate);
    }
  }, [issueDate]);

  useEffect(() => {
    if (issueDate && product) {
      fetchZoneIds(issueDate, product);
    }
  }, [issueDate, product]);

  useEffect(() => {
    if (issueDate && product && zone) {
      fetchPages(issueDate, product, zone);
    }
  }, [issueDate, product, zone]);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setIssueDate(newDate);
    sessionStorage.setItem("issueDate", newDate);
    setZone("");
    setPages([]);
    setSelectedPages([]);
  };

  const handleProductChange = (e) => {
    const newProduct = e.target.value;
    setProduct(newProduct);
    sessionStorage.setItem("product", newProduct);
    setZone("");
    setPages([]);
  };

  const handleZoneChange = (e) => {
    const newZone = e.target.value;
    setZone(newZone);
  };

  const handleEditionChange = (e) => {
    const newEdition = e.target.value;
    setEdition(newEdition);
  };

  const updateRefreshTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    setLastRefreshTime(timeString);
  };

  const fetchProductIds = async (date) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`);
      const productIds = response.data.map((item) => item.PRODUCT_ID);
      setProducts(productIds);
      if (!productIds.includes(product)) {
        setProduct(productIds[0] || "");
      }
    } catch (error) {
      console.error("Error fetching product IDs:", error);
    }
  };

  const fetchZoneIds = async (date, productId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`);
      const zoneIds = response.data.map((item) => item.ZONE_ID);
      setZones(zoneIds);
      setZone(zoneIds[0] || "");
    } catch (error) {
      console.error("Error fetching zone IDs:", error);
    }
  };

  const fetchPages = async (date, productId, zoneId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`);
      const pagesData = response.data.map((item) => ({
        pageId: item.Page_id,
        zoneId: item.Zone_id,
        status: item.Status,
        Page_Name: item.Page_Name
      }));
      setPages(pagesData);
      setSelectedPages(pagesData.filter(page => page.status === 'desired_status').map(page => page.pageId));
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  const fetchRevokeData = async () => {
    try {
      const dataToSend = {
        issueDate: issueDate,
        zoneId: zone,
        productId: product
      };

      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/revokePagez`, dataToSend, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      setPageData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };


  const handleCheckboxChange = (pageName) => (e) => {
    const isChecked = e.target.checked;
  
    setUpdateData((prevUpdateData) => {
      const newUpdateData = prevUpdateData.filter(update => update.pageName !== pageName);
  
      if (isChecked) {
        newUpdateData.push({
          issueDate,
          zoneId: zone,
          productId: product,
          pageName: pageName,
          newStatus: 'C',
          newNoOfRevokes: 1
        });
      }
  
      return newUpdateData;
    });
  };
  
  const handleSubmit = async () => {
    try {
      console.log(updateData);
      // Check if there are no checkboxes selected
      if (!updateData || updateData.length === 0) {
        setAlertTitle('Alert');
        setAlertMessage('Please select the checkbox to update.');
        setAlertShow(true);
        return;
      }
  
      setConfirmShow(true);
    } catch (error) {
      console.error('Error updating pages:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to update pages');
      setAlertShow(true);
    }
  };
  



  const handleConfirmSubmit = async () => {
    try {
      for (const update of updateData) {
        await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updaterevoke`, update, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      setAlertTitle('Success');
      setAlertMessage('Pages updated successfully');
      setAlertShow(true);
      setUpdateData([]);
      setConfirmShow(false);
    } catch (error) {
      console.error('Error updating pages:', error);
      setAlertTitle('Error');
      setAlertMessage('Failed to update pages');
      setAlertShow(true);
      setConfirmShow(false);
    }
  };

  const handleCancelConfirm = () => {
    setConfirmShow(false);
  };

  const handleCloseAlert = () => {
    setAlertShow(false);
  };

  const statusF = pageData.filter(page => page.Status === 'F');
  const statusW = pageData.filter(page => page.Status === 'W');

  return (
    <div className="container mt-4">
      <fieldset className="f_fieldset">
        <legend>Revoke Page</legend>
        <div className="form-row mb-3">
          <div className="form-group col-md-3">
            <input type="date" className="re_form-control" value={issueDate} onChange={handleDateChange} />
          </div>
          <div className="form-group col-md-3">
            <select className="form-control1" value={product} onChange={handleProductChange}>
              {products.length === 0 && (
                <option value="TAMILTH">TAMILTH</option>
              )}
              {products.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3">
            <select className="form-control1" value={zone} onChange={handleZoneChange}>
              <option value="Chennai">Select Zone</option>
              {zones.map((zon) => (
                <option key={zon} value={zon}>
                  {zon}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group col-md-3">
            <select className="form-control1" value={edition} onChange={handleEditionChange}>
              <option value="1">1</option>
            </select>
          </div>
          <div className="form-group btn-container">
            <button className="re_btn " onClick={fetchRevokeData}>View</button>
          </div>
        </div>
      </fieldset>

      <fieldset className="f_fieldset">
        <div className="table1 mb-4">
          <div className="table-responsive" style={{ marginRight: '20px', width: '35%' }}>
            <div>
              <h5>Finalised</h5>
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Page No</th>
                  <th>Page Name</th>
                  <th>Revoke</th>
                </tr>
              </thead>
              <tbody className="Status">
                {statusF.map((page, index) => (
                  <tr key={index}>
                    <td>{page.Page_No}</td>
                    <td>{page.Page_Name}</td>
                    <td>
                      <input
                        type="checkbox"
                        onChange={handleCheckboxChange(page.Page_Name)}
                        checked={updateData.some(update => update.pageName === page.Page_Name)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-responsive" style={{ width: '35%' }}>
            <div>
              <h5>Working</h5>
            </div>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Page No</th>
                  <th>Page Name</th>
                  <th>Finalize</th>
                </tr>
              </thead>
              <tbody className="Status1">
                {statusW.map((page, index) => (
                  <tr key={index}>
                    <td>{page.Page_No}</td>
                    <td>{page.Page_Name}</td>
                    <td>
                      <input type="checkbox" onChange={handleCheckboxChange(page.Page_Name)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </fieldset>

      <div className="re_center-button">
        <fieldset >
          <div className="form-group">
            <button className="re_btn " onClick={handleSubmit}>Submit</button>
          </div>
        </fieldset>
      </div>

      {/* Alert Modal */}
      <Modal show={alertShow} onHide={handleCloseAlert}>
        {/* <Modal.Header closeButton> */}
        {/* <Modal.Title>{alertTitle}</Modal.Title> */}
        {/* </Modal.Header> */}
        <Modal.Body>{alertMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleCloseAlert}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Modal */}
      <Modal show={confirmShow} onHide={() => setConfirmShow(false)}>
        {/* <Modal.Header closeButton> */}
        {/* <Modal.Title>Confirm</Modal.Title> */}
        {/* </Modal.Header> */}
        <Modal.Body>Are you sure you want to update pages?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmSubmit}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default App;