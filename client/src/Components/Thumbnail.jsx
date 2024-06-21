import React, { useState, useEffect } from "react";
import pageNotFound from "../Assest/pageNotFound1.png";
import "../Styles/Thumbnail.css";

const getCurrentDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  let month = now.getMonth() + 1;
  let day = now.getDate()+1;
  month = month < 10 ? `0${month}` : month;
  day = day < 10 ? `0${day}` : day;
  return `${year}-${month}-${day}`;
};

const Thumbnail = () => {
  const initialIssueDate =
    sessionStorage.getItem("issueDate") || getCurrentDate();
  const [issueDate, setIssueDate] = useState(initialIssueDate);
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState("TAMILTH");
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState("");
  const [edition, setEdition] = useState("1");
  const [lastRefreshTime, setLastRefreshTime] = useState("");
  const [pages, setPages] = useState([]);
  const [thumbnails, setThumbnails] = useState([]);
  const [plan, setPlan] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [initialThumbnails, setInitialThumbnails] = useState([]);

  useEffect(() => {
    updateRefreshTime();
    // fetchAllData(initialIssueDate);
  }, []);

  useEffect(() => {
    if (issueDate) {
      //   fetchAllData(issueDate);
      fetchProductIds(issueDate);
    }
  }, [issueDate]);

  useEffect(() => {
    if (product) {
      fetchZoneIds(issueDate, product).then((zoneIds) => {
        if (zoneIds.length > 0) {
          setZone(zoneIds[0]);
          fetchPages(issueDate, product, zoneIds[0]);
        }
      });
    }
  }, [product, issueDate]);

  useEffect(() => {
    if (zone) {
      fetchPages(issueDate, product, zone);
    } else {
      fetchPagess(issueDate, product);
    }
  }, [zone, product, issueDate]);

  const updateRefreshTime = () => {
    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];
    setLastRefreshTime(timeString);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setIssueDate(newDate);
    sessionStorage.setItem("issueDate", newDate);
    // setProduct("");
    setZone("");
    setPages([]);
    setThumbnails([]);
    setSelectedPage("");
  };

  const handleProductChange = (e) => {
    setProduct(e.target.value);
    sessionStorage.setItem("product", e.target.value);
    setZone("");
    setPages([]);
    setThumbnails([]);
    setPlan([]);
    setSelectedPage("");
  };

  const handleZoneChange = (e) => {
    setZone(e.target.value);
    sessionStorage.setItem("zone", e.target.value);
    setPages([]);
    setThumbnails([]);
    setPlan([]);
    setSelectedPage("");
  };

  const handleEditionChange = (e) => {
    setEdition(e.target.value);
    sessionStorage.setItem("edition", e.target.value);
    setThumbnails([]);
    setPlan([]);
    setSelectedPage("");
  };

  const handlePageSelect = (e) => {
    setSelectedPage(e.target.value);
    sessionStorage.setItem("page", e.target.value);
  };

  const handleListClick = async () => {
    if (selectedPage === "all page") {
      // fetchAllData(initialIssueDate);
    } else {
      const formattedDate = formatDate(issueDate);

      const extractTime = (lastModified) => {
        const parts = lastModified.split(" ");
        return parts[4];
      };

      if (!zone || zone.length === 0) {
        // Assuming 'zones' is an array containing all available zones
        const imageUrls = zones.map(
          (singleZone) =>
            `${process.env.REACT_APP_IPCONFIG}api/reporter/images?date=${formattedDate}&zone=${singleZone}&product=${product}&page=${selectedPage}&edition=${edition}`
        );

        setThumbnails("");
        console.log(imageUrls);

        try {
          const thumbnails = await Promise.all(
            imageUrls.map(async (url, index) => {
              // Added index parameter to map function
              try {
                const response = await fetch(url);
                if (response.ok) {
                  const lastModified = response.headers.get("last-modified");
                  const modifiedTime = lastModified ? extractTime(lastModified) : null;
                  return {
                    src: response.url,
                    alt: `${selectedPage}`,
                    modifiedDate: modifiedTime,
                    zone: zones[index], // Add singleZone value to response object
                  };
                } else {
                  console.error(
                    `Error fetching thumbnail for page ${selectedPage}: ${response.statusText}`
                  );
                  return null;
                }
              } catch (error) {
                console.error(
                  `Error fetching thumbnail for page ${selectedPage}:`,
                  error
                );
                return null;
              }
            })
          );

          const filteredThumbnails = thumbnails.filter(
            (thumbnail) => thumbnail !== null
          );
          setThumbnails(filteredThumbnails);
        } catch (error) {
          console.error("Error fetching thumbnails:", error);
        }
      } else {
        const imageUrl = `${process.env.REACT_APP_IPCONFIG}api/reporter/images?date=${formattedDate}&zone=${zone}&product=${product}&page=${selectedPage}&edition=${edition}`;
        setThumbnails("");
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const lastModified = response.headers.get("last-modified");
            const modifiedTime = lastModified ? extractTime(lastModified) : null;

            setThumbnails([
              {
                src: response.url,
                alt: `${selectedPage}`,
                modifiedDate: modifiedTime,
                zone: `${zone}`,
              },
            ]);
          } else {
            console.error(
              `Error fetching thumbnail for page ${selectedPage}: ${response.statusText}`
            );
          }
        } catch (error) {
          console.error(
            `Error fetching thumbnail for page ${selectedPage}:`,
            error
          );
        }
      }
    }
  };

  console.log("thumbnails", thumbnails);

  useEffect(() => {
    if (initialThumbnails.length > 0 && plan.length > 0) {
      arrangeThumbnailsAccordingToPlan();
    }
  }, [initialThumbnails, plan]);

  const fetchProductIds = async (date) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/products-ids?date=${date}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const productIds = data.map((item) => item.PRODUCT_ID);
      setProducts(productIds);
      return productIds;
    } catch (error) {
      console.error("Error fetching product IDs:", error);
      return [];
    }
  };

  const fetchZoneIds = async (date, productId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const zoneIds = data.map((item) => item.ZONE_ID);
      setZones(zoneIds);
      return zoneIds;
    } catch (error) {
      console.error("Error fetching zone IDs:", error);
      return [];
    }
  };

  const fetchPages = async (date, productId, zoneId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const pages = data.map((item) => ({
        pageId: item.Page_id,
        zoneId: item.Zone_id,
      }));
      setPages(pages);
      fetchThumbnails(date, zoneId, productId, pages);
      fetchPDFs(date, zoneId, productId, pages);
      fetchPlan(date, zoneId, productId);
      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  };

  const fetchPagess = async (date, productId, zoneId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/pages-withoutzones?date=${date}&productId=${productId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const pages = data.map((item) => ({
        pageId: item.Page_Name,
      }));
      setPages(pages);
      console.log(pages);
      return pages;
    } catch (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
  };

  const fetchPlan = async (issueDate, zoneId, productId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_IPCONFIG}api/reporter/plandata?date=${issueDate}&zoneId=${zoneId}&productId=${productId}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const plan = data.map((item) => ({
        pageNumbers: item.Page_No,
        pageNames: item.Page_Name,
      }));
      setPlan(plan);
      return plan;
    } catch (error) {
      console.error("Error fetching plans:", error);
      return [];
    }
  };

  const formatDate = (date) => {
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  };

  const fetchThumbnails = async (issueDate, zone, product, pages) => {
    if (!pages || pages.length === 0) return;
    const formattedDate = formatDate(issueDate);

    const extractTime = (lastModified) => {
      const parts = lastModified.split(" ");
      return parts[4];
    };

    try {
      const thumbnails = await Promise.all(
        pages.map(async (page) => {
          const imageUrl = `${process.env.REACT_APP_IPCONFIG}api/reporter/images?date=${formattedDate}&zone=${zone}&product=${product}&page=${page.pageId}&edition=${edition}`;
          //   console.log(`Fetching thumbnail from: ${imageUrl}`); // Log the URL being fetched

          try {
            const response = await fetch(imageUrl);
            if (response.ok) {
              const lastModified = response.headers.get("last-modified");
              const modifiedTime = lastModified ? extractTime(lastModified) : null;
              //   console.log(
              //     `Last modified for page ${page.pageId}: ${lastModified}`
              //   );
              return {
                src: response.url,
                alt: `${page.pageId}`,
                zone: `${zone}`,
                modifiedDate: modifiedTime, // Set the modifiedDate property
              };
            } else {
              console.error(
                `Error fetching thumbnail for page ${page.pageId}: ${response.statusText}`
              );
              return null;
            }
          } catch (error) {
            console.error(
              `Error fetching thumbnail for page ${page.pageId}:`,
              error
            );
            return null;
          }
        })
      );

      const filteredThumbnails = thumbnails.filter(
        (thumbnail) => thumbnail !== null
      );

      setThumbnails(filteredThumbnails);
      setInitialThumbnails(filteredThumbnails);
    } catch (error) {
      console.error("Error fetching thumbnails:", error);
    }
  };

  const fetchPDFs = async (imageUrls) => {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

    const urls = await Promise.all(
      imageUrls.map(async (imageUrl) => {
        const url = new URL(imageUrl);
        const params = new URLSearchParams(url.search);
        const formattedDate = params.get("date");
        const zone = params.get("zone");
        const product = params.get("product");
        const page = params.get("page");
        const edition = params.get("edition");

        try {
          const response = await fetch(
            `${process.env.REACT_APP_IPCONFIG}api/reporter/pdf?date=${formattedDate}&zone=${zone}&product=${product}&page=${page}&edition=${edition}`
          );
          if (response.ok) {
            const pdfUrl = response.url;
            window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
          } else {
            console.error(
              `Failed to fetch PDF for page ${page}. Status: ${response.status}, ${response.statusText}`
            );
          }
        } catch (error) {
          console.error(`Error fetching PDF for page ${page}:`, error);
        }
      })
    );
  };

  const handleThumbnailClick = (imageUrl) => {
    if (imageUrl) {
      fetchPDFs([imageUrl]);
    } else {
      alert("No image found");
    }
  };

  const arrangeThumbnailsAccordingToPlan = () => {
    const arrangedThumbnails = plan.map((planItem) => {
      const matchingThumbnail = initialThumbnails.find((thumbnail) =>
        thumbnail.alt.includes(planItem.pageNames)
      );
      return matchingThumbnail || { src: "", alt: `${planItem.pageNames}` };
    });
    setThumbnails(arrangedThumbnails);
  };

  return (
    <div className="main-content">
      <div className="t-container">
        <h1>Thumb Nail Page View</h1>
        <div className="t-input-container">
          <div className="t-form-group">
            <label>Issue Date:</label>
            <input
              type="date"
              className="t-date-input"
              value={issueDate}
              onChange={handleDateChange}
            />
          </div>
          <div className="t-form-group">
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
          <div className="t-form-group">
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
          <div className="t-form-group">
            <label>Edition:</label>
            <select value={edition} onChange={handleEditionChange}>
              <option value="1">1</option>
            </select>
          </div>
          <div className="t-form-group">
            <label>Select Page:</label>
            <select value={selectedPage} onChange={handlePageSelect}>
              <option value="all page"></option>
              {pages.map((page) => (
                <option key={page.pageId} value={page.pageId}>
                  {page.pageId}
                </option>
              ))}
            </select>
          </div>
          <div className="t-form-group1">
            <button className="t-list_button" onClick={handleListClick}>
              List
            </button>
          </div>

          {/* <div className="t-last-refresh">
            Last Refresh Page:{" "}
            <span className="t-refresh-time">{lastRefreshTime}</span>
          </div> */}
        </div>
        <div className="t-last-refresh">
          Last Refresh Page:{" "}
          <span className="t-refresh-time">{lastRefreshTime}</span>
        </div>
        <div className="t-output-container">
          <div className="t-thumbnails-grid">
            {Array.isArray(thumbnails) ? (
              thumbnails.map((thumbnail, index) => (
                <div
                  key={index}
                  className="t-thumbnail"
                  onClick={() => handleThumbnailClick(thumbnail.src)}
                >
                  <img
                    src={thumbnail.src}
                    alt={thumbnail.alt}
                    onError={(e) => (e.target.src = pageNotFound)}
                  />
                  <div className="t-thumbnail-caption">
                    <span>{thumbnail.zone} - </span>
                    <span>{thumbnail.alt}  </span>
                    <span>   {thumbnail.modifiedDate}</span>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="t-thumbnail"
                onClick={() => handleThumbnailClick(thumbnails)}
              >
                <img
                  src={thumbnails}
                  alt="Thumbnail"
                  onError={(e) => (e.target.src = pageNotFound)}
                />
                <div className="t-thumbnail-caption">
                  <span>Thumbnail</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Thumbnail;

// import React, { useState, useEffect } from "react";
// import pageNotFound from "./images/pageNotFound.png";
// import "./App.css";

// const getCurrentDate = () => {
//   const now = new Date();
//   const year = now.getFullYear();
//   let month = now.getMonth() + 1;
//   let day = now.getDate();
//   month = month < 10 ? `0${month}` : month;
//   day = day < 10 ? `0${day}` : day;
//   return `${year}-${month}-${day}`;
// };

// const Thumbnail = () => {
//   const initialIssueDate =
//     sessionStorage.getItem("issueDate") || getCurrentDate();
//   const [issueDate, setIssueDate] = useState(initialIssueDate);
//   const [products, setProducts] = useState([]);
//   const [product, setProduct] = useState("TAMILTH");
//   const [zones, setZones] = useState([]);
//   const [zone, setZone] = useState("");
//   const[editions, setEditions]=useState([]);
//   const [edition, setEdition] = useState("1");
//   const [lastRefreshTime, setLastRefreshTime] = useState("");
//   const [pages, setPages] = useState([]);
//   const [thumbnails, setThumbnails] = useState([]);
//   const [plan, setPlan] = useState([]);
//   const [selectedPage, setSelectedPage] = useState("");
//   const [initialThumbnails, setInitialThumbnails] = useState([]);

//   useEffect(() => {
//     updateRefreshTime();
//     // fetchAllData(initialIssueDate);
//   }, []);

//   useEffect(() => {
//     if (issueDate) {
//       //   fetchAllData(issueDate);
//       fetchProductIds(issueDate);
//     }
//   }, [issueDate]);

//   useEffect(() => {
//     if (product) {
//       fetchEditionIds(issueDate, product).then((editionIds) => {
//         if (editionIds.length > 0) {
//           setEdition(editionIds[0]);
//         }
//       });
//     }
//   }, [product, issueDate]);

//   useEffect(() => {
//     if (product) {
//       fetchZoneIds(issueDate, product).then((zoneIds) => {
//         if (zoneIds.length > 0) {
//           setZone(zoneIds[0]);
//           fetchPages(issueDate, product, zoneIds[0]);
//         }
//       });
//     }
//   }, [product, issueDate]);

//   useEffect(() => {
//     if (zone) {
//       fetchPages(issueDate, product, zone);
//     } else {
//       fetchPagess(issueDate, product);
//     }
//   }, [zone, product, issueDate]);

//   const updateRefreshTime = () => {
//     const now = new Date();
//     const timeString = now.toTimeString().split(" ")[0];
//     setLastRefreshTime(timeString);
//   };

//   const handleDateChange = (e) => {
//     const newDate = e.target.value;
//     setIssueDate(newDate);
//     sessionStorage.setItem("issueDate", newDate);
//     // setProduct("");
//     setZone("");
//     setPages([]);
//     setThumbnails([]);
//     setSelectedPage("");
//   };

//   const handleProductChange = (e) => {
//     setProduct(e.target.value);
//     sessionStorage.setItem("product", e.target.value);
//     setZone("");
//     setPages([]);
//     setThumbnails([]);
//     setPlan([]);
//     setSelectedPage("");
//   };

//   const handleZoneChange = (e) => {
//     setZone(e.target.value);
//     sessionStorage.setItem("zone", e.target.value);
//     setPages([]);
//     setThumbnails([]);
//     setPlan([]);
//     setSelectedPage("");
//   };

//   const handleEditionChange = (e) => {
//     setEdition(e.target.value);
//     sessionStorage.setItem("edition", e.target.value);
//     setPages([]);
//     setThumbnails([]);
//     setPlan([]);
//     setSelectedPage("");
//   };

//   const handlePageSelect = (e) => {
//     setSelectedPage(e.target.value);
//     sessionStorage.setItem("page", e.target.value);
//   };

//   const handleListClick = async () => {
//     if (selectedPage === "all page") {
//       // fetchAllData(initialIssueDate);
//     } else {
//       const formattedDate = formatDate(issueDate);

//       if (!zone || zone.length === 0) {
//         // Assuming 'zones' is an array containing all available zones
//         const imageUrls = zones.map(
//           (singleZone) =>
//             `http://192.168.90.77:3800/api/reporter/images?date=${formattedDate}&zone=${singleZone}&product=${product}&page=${selectedPage}&edition=${edition}`
//         );

//         setThumbnails("");
//         console.log(imageUrls);

//         try {
//           const thumbnails = await Promise.all(
//             imageUrls.map(async (url, index) => {
//               // Added index parameter to map function
//               try {
//                 const response = await fetch(url);
//                 if (response.ok) {
//                   const lastModified = response.headers.get("last-modified");
//                   return {
//                     src: response.url,
//                     alt: `${selectedPage}`,
//                     modifiedDate: lastModified,
//                     zone: zones[index], // Add singleZone value to response object
//                   };
//                 } else {
//                   console.error(
//                     `Error fetching thumbnail for page ${selectedPage}: ${response.statusText}`
//                   );
//                   return null;
//                 }
//               } catch (error) {
//                 console.error(
//                   `Error fetching thumbnail for page ${selectedPage}:`,
//                   error
//                 );
//                 return null;
//               }
//             })
//           );

//           const filteredThumbnails = thumbnails.filter(
//             (thumbnail) => thumbnail !== null
//           );
//           setThumbnails(filteredThumbnails);
//         } catch (error) {
//           console.error("Error fetching thumbnails:", error);
//         }
//       } else {
//         const imageUrl = `http://192.168.90.77:3800/api/reporter/images?date=${formattedDate}&zone=${zone}&product=${product}&page=${selectedPage}&edition=${edition}`;
//         setThumbnails("");
//         try {
//           const response = await fetch(imageUrl);
//           if (response.ok) {
//             const lastModified = response.headers.get("last-modified");
//             setThumbnails([
//               {
//                 src: response.url,
//                 alt: `${selectedPage}`,
//                 modifiedDate: lastModified,
//                 zone:`${zone}`,
//               },
//             ]);
//           } else {
//             console.error(
//               `Error fetching thumbnail for page ${selectedPage}: ${response.statusText}`
//             );
//           }
//         } catch (error) {
//           console.error(
//             `Error fetching thumbnail for page ${selectedPage}:`,
//             error
//           );
//         }
//       }
//     }
//   };

//   console.log("thumbnails", thumbnails);

//   useEffect(() => {
//     if (initialThumbnails.length > 0 && plan.length > 0) {
//       arrangeThumbnailsAccordingToPlan();
//     }
//   }, [initialThumbnails, plan]);

//   const fetchProductIds = async (date) => {
//     try {
//       const response = await fetch(
//         `http://192.168.90.77:3800/api/reporter/product-ids?date=${date}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       const productIds = data.map((item) => item.PRODUCT_ID);
//       setProducts(productIds);
//       return productIds;
//     } catch (error) {
//       console.error("Error fetching product IDs:", error);
//       return [];
//     }
//   };

//   const fetchZoneIds = async (date, productId) => {
//     try {
//       const response = await fetch(
//         `http://192.168.90.77:3800/api/reporter/zone-ids-by-product?date=${date}&productId=${productId}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       const zoneIds = data.map((item) => item.ZONE_ID);
//       setZones(zoneIds);
//       return zoneIds;
//     } catch (error) {
//       console.error("Error fetching zone IDs:", error);
//       return [];
//     }
//   };

//   const fetchEditionIds = async (date, productId) => {
//     try {
//       const response = await fetch(
//         `http://192.168.90.77:3800/api/reporter/edition-id?date=${date}&productId=${productId}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       const editionIds = data.map((item) => item.EDITION_ID);
//       setEditions(editionIds);
//       return editionIds;
//     } catch (error) {
//       console.error("Error fetching zone IDs:", error);
//       return [];
//     }
//   };

//   const fetchPages = async (date, productId, zoneId) => {
//     try {
//       const response = await fetch(
//         `http://192.168.90.77:3800/api/reporter/pages-zones?date=${date}&productId=${productId}&zoneId=${zoneId}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       const pages = data.map((item) => ({
//         pageId: item.Page_id,
//         zoneId: item.Zone_id,
//       }));
//       setPages(pages);
//       fetchThumbnails(date, zoneId, productId, pages);
//       fetchPDFs(date, zoneId, productId, pages);
//       fetchPlan(date, zoneId, productId);
//       return pages;
//     } catch (error) {
//       console.error("Error fetching pages:", error);
//       return [];
//     }
//   };

//   const fetchPagess = async (date, productId, zoneId) => {
//     try {
//       const response = await fetch(
//         `http://192.168.90.77:3800/api/reporter/pages-withoutzones?date=${date}&productId=${productId}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       const pages = data.map((item) => ({
//         pageId: item.Page_Name,
//       }));
//       setPages(pages);
//       console.log(pages);
//       return pages;
//     } catch (error) {
//       console.error("Error fetching pages:", error);
//       return [];
//     }
//   };

//   const fetchPlan = async (issueDate, zoneId, productId) => {
//     try {
//       const response = await fetch(
//         `http://192.168.90.77:3800/api/reporter/plandata?date=${issueDate}&zoneId=${zoneId}&productId=${productId}`
//       );
//       if (!response.ok) throw new Error("Network response was not ok");
//       const data = await response.json();
//       const plan = data.map((item) => ({
//         pageNumbers: item.Page_No,
//         pageNames: item.Page_Name,
//       }));
//       setPlan(plan);
//       return plan;
//     } catch (error) {
//       console.error("Error fetching plans:", error);
//       return [];
//     }
//   };

//   const formatDate = (date) => {
//     const [year, month, day] = date.split("-");
//     return `${day}-${month}-${year}`;
//   };

//   const fetchThumbnails = async (issueDate, zone, product, pages) => {
//     if (!pages || pages.length === 0) return;
//     const formattedDate = formatDate(issueDate);

//     try {
//       const thumbnails = await Promise.all(
//         pages.map(async (page) => {
//           const imageUrl = `http://192.168.90.77:3800/api/reporter/images?date=${formattedDate}&zone=${zone}&product=${product}&page=${page.pageId}&edition=${edition}`;
//           //   console.log(`Fetching thumbnail from: ${imageUrl}`); // Log the URL being fetched

//           try {
//             const response = await fetch(imageUrl);
//             if (response.ok) {
//               const lastModified = response.headers.get("last-modified");
//               //   console.log(
//               //     `Last modified for page ${page.pageId}: ${lastModified}`
//               //   );
//               return {
//                 src: response.url,
//                 alt: `${page.pageId}`,
//                 zone:`${zone}`,
//                 modifiedDate: lastModified, // Set the modifiedDate property
//               };
//             } else {
//               console.error(
//                 `Error fetching thumbnail for page ${page.pageId}: ${response.statusText}`
//               );
//               return null;
//             }
//           } catch (error) {
//             console.error(
//               `Error fetching thumbnail for page ${page.pageId}:`,
//               error
//             );
//             return null;
//           }
//         })
//       );

//       const filteredThumbnails = thumbnails.filter(
//         (thumbnail) => thumbnail !== null
//       );

//       setThumbnails(filteredThumbnails);
//       setInitialThumbnails(filteredThumbnails);
//     } catch (error) {
//       console.error("Error fetching thumbnails:", error);
//     }
//   };

//   const fetchPDFs = async (imageUrls) => {
//     if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

//     const urls = await Promise.all(
//       imageUrls.map(async (imageUrl) => {
//         const url = new URL(imageUrl);
//         const params = new URLSearchParams(url.search);
//         const formattedDate = params.get("date");
//         const zone = params.get("zone");
//         const product = params.get("product");
//         const page = params.get("page");
//         const edition = params.get("edition");

//         try {
//           const response = await fetch(
//             `http://192.168.90.77:3800/api/reporter/pdf?date=${formattedDate}&zone=${zone}&product=${product}&page=${page}&edition=${edition}`
//           );
//           if (response.ok) {
//             const pdfUrl = response.url;
//             window.open(pdfUrl, "_blank"); // Open the PDF in a new tab
//           } else {
//             console.error(
//               `Failed to fetch PDF for page ${page}. Status: ${response.status}, ${response.statusText}`
//             );
//           }
//         } catch (error) {
//           console.error(`Error fetching PDF for page ${page}:`, error);
//         }
//       })
//     );
//   };

//   const handleThumbnailClick = (imageUrl) => {
//     if (imageUrl) {
//       fetchPDFs([imageUrl]);
//     } else {
//       alert("No image found");
//     }
//   };

//   const arrangeThumbnailsAccordingToPlan = () => {
//     const arrangedThumbnails = plan.map((planItem) => {
//       const matchingThumbnail = initialThumbnails.find((thumbnail) =>
//         thumbnail.alt.includes(planItem.pageNames)
//       );
//       return matchingThumbnail || { src: "", alt: `${planItem.pageNames}` };
//     });
//     setThumbnails(arrangedThumbnails);
//   };

//   return (
//     <>
//       <div className="container">
//         <h1>Thumb Nail Page View</h1>
//         <div className="input-container">
//           <div className="form-group">
//             <label>Issue Date:</label>
//             <input type="date" value={issueDate} onChange={handleDateChange} />
//           </div>
//           <div className="form-group">
//             <label>Product:</label>
//             <select value={product} onChange={handleProductChange}>
//               <option value="">Select Product</option>
//               {products.map((prod) => (
//                 <option key={prod} value={prod}>
//                   {prod}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Zone:</label>
//             <select value={zone} onChange={handleZoneChange}>
//               <option value="">Select Zone</option>
//               {zones.map((zon) => (
//                 <option key={zon} value={zon}>
//                   {zon}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Edition:</label>
//             <select value={edition} onChange={handleEditionChange}>
//               <option value="1">1</option>
//               {editions.map((edi) => (
//                 <option key={edi} value={edi}>
//                   {edi}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group">
//             <label>Select Page:</label>
//             <select value={selectedPage} onChange={handlePageSelect}>
//               <option value="all page"></option>
//               {pages.map((page) => (
//                 <option key={page.pageId} value={page.pageId}>
//                   {page.pageId}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="form-group1">
//             <button className="list_button" onClick={handleListClick}>
//               List
//             </button>
//           </div>
//         </div>
//         <div className="last-refresh">
//           Last Refresh Page:{" "}
//           <span className="refresh-time">{lastRefreshTime}</span>
//         </div>
//         <div className="output-container">
//           <div className="thumbnails-grid">
//             {Array.isArray(thumbnails) ? (
//               thumbnails.map((thumbnail, index) => (
//                 <div
//                   key={index}
//                   className="thumbnail"
//                   onClick={() => handleThumbnailClick(thumbnail.src)}
//                 >
//                   <img
//                     src={thumbnail.src}
//                     alt={thumbnail.alt}
//                     onError={(e) => (e.target.src = pageNotFound)}
//                   />
//                   <div className="thumbnail-caption">
//                   <span>{thumbnail.zone}</span>
//                     <span>{thumbnail.alt}</span>
//                     <span>{thumbnail.modifiedDate}</span>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div
//                 className="thumbnail"
//                 onClick={() => handleThumbnailClick(thumbnails)}
//               >
//                 <img
//                   src={thumbnails}
//                   alt="Thumbnail"
//                   onError={(e) => (e.target.src = pageNotFound)}
//                 />
//                 <div className="thumbnail-caption">
//                   <span>Thumbnail</span>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };
// export default Thumbnail;
