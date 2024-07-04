import React, { useState, useEffect } from "react";
import "../Styles/Revoke.css";
import axios from 'axios';
 
// Function to get current date in YYYY-MM-DD format
const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate();
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  return `${year}-${month}-${day}`;
};
 
const App = () => {
  const [issueDate, setIssueDate] = useState(() => sessionStorage.getItem("issueDate") || getCurrentDate());
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState("");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("");
  const [edition, setEdition] = useState("1");
  const [lastRefreshTime, setLastRefreshTime] = useState("");
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pageData, setPageData] = useState([]);
  const [updateData, setUpdateData] = useState([]); // State to store update data
 
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
    setProduct("");
    setZone("");
    setPages([]);
    setSelectedPages([]);
  };
 
  const handleProductChange = (e) => {
    const newProduct = e.target.value;
    setProduct(newProduct);
    setZone("");
    setPages([]);
    setSelectedPages([]);
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
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`
      );
      const productIds = response.data.map((item) => item.PRODUCT_ID);
      setProducts(productIds);
      setProduct(productIds[0] || "");
    } catch (error) {
      console.error("Error fetching product IDs:", error);
    }
  };
 
  const fetchZoneIds = async (date, productId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`
      );
      const zoneIds = response.data.map((item) => item.ZONE_ID);
      setZones(zoneIds);
      setZone(zoneIds[0] || "");
    } catch (error) {
      console.error("Error fetching zone IDs:", error);
    }
  };
 
  const fetchPages = async (date, productId, zoneId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
      );
      const pagesData = response.data.map((item) => ({
        pageId: item.Page_id,
        zoneId: item.Zone_id,
        status: item.Status,
        Page_Name: item.Page_Name // Assuming Page_Name is available in your API response
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
 
      const response = await axios.post(
        `${process.env.REACT_APP_IPCONFIG}api/revokePagez`,
        dataToSend,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
 
      setPageData(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching page data:', error);
    }
  };
 
  const handleCheckboxChange = (pageName) => (e) => {
    const isChecked = e.target.checked;
    // console.log(pageName);
 
    setUpdateData((prevUpdateData) => {
      const newUpdateData = prevUpdateData.filter(update => update.pageName !== pageName);
 
      if (isChecked) {
        newUpdateData.push({
          issueDate,
          zoneId: zone,
          productId: product,
          pageName:pageName,
          newStatus: 'C',
          newNoOfRevokes: 1
        });
      } else {
        newUpdateData.push({
          issueDate,
          zoneId: zone,
          productId: product,
          pageName:pageName,
          newStatus: 'F',
          newNoOfRevokes: -1
        });
      }
 
      return newUpdateData;
    });
  };
 
  const handleSubmit = async () => {
    try {
      for (const update of updateData) {
        console.log("update",update);
        await axios.post(`${process.env.REACT_APP_IPCONFIG}api/updaterevoke`, update, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
 
      alert('Pages updated successfully');
      setUpdateData([]);
    } catch (error) {
      console.error('Error updating pages:', error);
      alert('Failed to update pages');
    }
  };
 
  // Filter based on the fetched page data
  const statusF = pageData.filter(page => page.Status === 'F');
  const statusW = pageData.filter(page => page.Status === 'W');
 
  return (
    <div className="main-content">
    <div className="container">
      <fieldset className="fieldset">
        <h2>Revoke Page</h2>
        <div className="input-container">
          <div className="form-group">
            <label>Issue Date:</label>
            <input type="date" value={issueDate} onChange={handleDateChange} />
          </div>
          <div className="form-group">
            <label>Product:</label>
            <select value={product} onChange={handleProductChange}>
              <option value="">Select Product</option>
              {products.map((prod) => (
                <option key={prod} value={prod}>
                  {prod}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Zone:</label>
            <select value={zone} onChange={handleZoneChange}>
              <option value="">Select Zone</option>
              {zones.map((zon) => (
                <option key={zon} value={zon}>
                  {zon}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Edition:</label>
            <select value={edition} onChange={handleEditionChange}>
              <option value="1">1</option>
              {/* Add more options here as needed */}
            </select>
          </div>
          <div className="form-group">
            <button onClick={fetchRevokeData}>View</button>
          </div>
        </div>
      </fieldset>
 
      <fieldset className="fieldset1">
        <div className="status">
          <h3>Finalized</h3>
          <div className="status-content">
            <table className="table">
              <thead>
                <tr>
                  <th>page no</th>
                  <th>Page Name</th>
                  <th>Revoke</th>
                 
                </tr>
              </thead>
              <tbody>
                {statusF.map((page, index) => (
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
 
        <div className="status">
          <h3>Working</h3>
          <div className="status-content">
            <table className="table">
              <thead>
                <tr>
                  <th>Page Name</th>
                  <th>Revoke</th>
                </tr>
              </thead>
              <tbody>
                {statusW.map((page, index) => (
                  <tr key={index}>
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
 
      <div className="button">
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
    </div>
  );
};
 
export default App;
 