
import React, { useState, useEffect } from "react";
import axios from "axios";
 
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
  const initialIssueDate = sessionStorage.getItem("issueDate") || getCurrentDate();
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(sessionStorage.getItem("product") || "");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("");
  const [edition, setEdition] = useState("1");
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState({});
  const [showPages, setShowPages] = useState(false);
 
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
    setSelectedPages({});
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
 
  const handleViewClick = () => {
    setShowPages(true);
  };
 
  const handleCheckboxChange = (pageId) => (e) => {
    const isChecked = e.target.checked;
 
    setSelectedPages((prevSelectedPages) => {
      const updatedPages = { ...prevSelectedPages };
 
      // Update the clicked checkbox
      if (isChecked) {
        updatedPages[pageId] = {
          ...updatedPages[pageId],
          isActive: 1,
          isNotActive: 0,
        };
      } else {
        updatedPages[pageId] = {
          ...updatedPages[pageId],
          isActive: 0,
          isNotActive: 2,
        };
      }
 
      // Update all other checkboxes
      Object.keys(updatedPages).forEach((key) => {
        if (key !== pageId) {
          if (isChecked) {
            updatedPages[key] = {
              ...updatedPages[key],
              isActive: 0,
              isNotActive: 1,
            };
          } else {
            updatedPages[key] = {
              ...updatedPages[key],
              isActive: 2,
              isNotActive: 0,
            };
          }
        }
      });
 
      return updatedPages;
    });
  };
 
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
      const activeUpdates = Object.keys(selectedPages).map((pageId) => ({
        pageId,
        isActive: selectedPages[pageId].isActive,
      }));
 
      const confirmed = window.confirm('Are you sure you want to update pages?');
      if (!confirmed) {
        return; // Do nothing if user cancels
      }
 
      const response = await axios.post(`${process.env.REACT_APP_IPCONFIG}api/pageactive`, {
        issueDate,
        productId: product,
        zoneId: zone,
        activeUpdates,
      });
 
      alert(`Updated ${response.data.rowsUpdated} row(s) in plan_page`);
      setSelectedPages({});
    } catch (error) {
      console.error("Error updating pages:", error);
      alert("Failed to update pages");
    }
  };
 
 
 
  const fetchProductIds = async (date) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`
      );
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
 
  const fetchPages = async (date, productId, zoneId, ) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
      );
      console.log(response.data);
      const pagesData = response.data.map((item) => ({
        pageId: item.Page_id,
        zoneId: item.Zone_id,
        active: item.Active,
        Page_Name: item.Page_Name || item.Page_id, // Fallback to Page_id if Page_Name is not available
      }));
      setPages(pagesData);
      // console.log(pagesData);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };
 
  const u = pages.filter(page => page.Active === '1');
 
  return (
    <div className="container">
      <h2>Active Page</h2>
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
          </select>
        </div>
        <div className="form-group">
          <button onClick={handleViewClick}>View</button>
        </div>
      </div>
 
      {showPages && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="checkbox-group">
              {pages.map((page) => (
                <div key={page.pageId}>
                  <label htmlFor={`page-${page.pageId}`}>
                    <input
                      type="checkbox"
                      id={`page-${page.pageId}`}
                      checked={selectedPages[page.pageId]?.isActive === 1}
                      onChange={handleCheckboxChange(page.pageId)}
                    />
                    {page.Page_Name || page.pageId}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <button type="submit">Update Active Status</button>
          </div>
        </form>
      )}
    </div>
  );
};
 
export default App;
 

 
 

 
 