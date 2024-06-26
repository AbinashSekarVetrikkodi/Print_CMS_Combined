// src/controllers/controller.js
const pool = require('../database/db');
const { Buffer } = require('buffer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { log } = require('console');


// Function to encode text to Base64
function encodeToBase64(text) {
  const buffer = Buffer.from(text, 'utf-8');
  return buffer.toString('base64');
}

function decodeFromBase64(base64Text) {
  try {
    const buffer = Buffer.from(base64Text, 'base64');
    return buffer.toString('utf-8');
  } catch (err) {
    console.error('Error decoding Base64:', err);
    return base64Text; // Return the original text if decoding fails
  }
}

function isBase64(str) {
  if (typeof str !== 'string' || str.length % 4 !== 0 || /[^A-Za-z0-9+/=]/.test(str)) {
    return false;
  }
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch (err) {
    return false;
  }
}


//---Function to form a Image tag for total xml---------
async function ImageCaption (imagename , imagecaption,foldername)
{

  const splitImage = imagename.split('~');
  const splitCaption = imagecaption.split('/n');

  let totalImageTag = '';

  // Iterate over the images and captions, assuming captions are fewer or equal to images
  for (let i = 0; i < splitImage.length; i++) {
    const image = splitImage[i];
    const caption = splitCaption[i] || ''; // Use empty string if caption is not available

    // Construct the image tag with caption
    const imageTag = `<Image href='file:///D:/EditorialImage/${foldername}/HighRes/${image}' /><cutline><span>${caption}</span></cutline>`;
    
    // Append to the totalImageTag string
    totalImageTag += imageTag;
  }

 console.log("totalImageTag :",totalImageTag);
  return totalImageTag;
}

// --------- Get Zone Code ---------
async function Zone_Code(zoneName) {
  try {
    const query = "SELECT Zone_Code FROM parent_zone_mapping WHERE Zone_Name = ?";
    const [rows] = await pool.query(query, [zoneName]);
    return rows.length > 0 ? rows[0].Zone_Code : null;
  } catch (error) {
    console.error('Error in ZoneCode:', error);
    throw new Error('Failed to retrieve Zone_Code');
  }
}

exports.Zone_Name_api = async (req, res) => {
  const { zoneCode } = req.body;
  console.log(zoneCode);

  try {
    const query = "SELECT Zone_Name FROM parent_zone_mapping WHERE Zone_Code=?";
    const [rows] = await pool.query(query, [zoneCode]);

    if (rows.length > 0) {
      res.status(200).json(rows[0].Zone_Name);
    } else {
      res.status(404).json({ error: 'Zone_Code not found' });
    }
  } catch (error) {
    console.error('Error in Zone_Code_api:', error);
    res.status(500).json({ error: 'Failed to retrieve Zone_Code' });
  }
};

// Get Product ID
async function product_Id(productname) {
  try {
    const query = 'SELECT Product_Id FROM mas_product WHERE Product_Name = ?';
    const [rows] = await pool.query(query, [productname]);
    return rows.length > 0 ? rows[0].Product_Id : null;
  } catch (error) {
    console.error('Error fetching product ID:', error);
    throw new Error('Failed to retrieve Product_Id');
  }
}

exports.product_name_api = async (req, res) => {
  const { Product_Id } = req.body;
  try {
    const query = 'SELECT Product_Name FROM mas_product WHERE Product_Id = ?';
    const [rows] = await pool.query(query, [Product_Id]);

    if (rows.length > 0) {
      res.status(200).json(rows[0].Product_Name);
    } else {
      res.status(404).json({ error: 'Product_Code not found' });
    }
  } catch (error) {
    console.error('Error in Zone_Code_api:', error);
    res.status(500).json({ error: 'Failed to retrieve Zone_Code' });
  }
}


// Get User ID
async function User_Id(username) {
  try {
    const query = 'SELECT User_Id FROM mas_user WHERE User_name = ?';
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0].User_Id : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw new Error('Failed to retrieve User_Id');
  }
}

exports.User_Id_api = async (req, res) => {
  const { username } = req.body;
  try {
    const query = 'SELECT User_Id FROM mas_user WHERE User_name = ?';
    const [rows] = await pool.query(query, [username]);
    return rows.length > 0 ? rows[0].User_Id : null;
  } catch (error) {
    console.error('Error fetching user ID:', error);
    throw new Error('Failed to retrieve User_Id');
  }
}



// Get XML name
const xml_name = async () => {
  try {
    const [rows] = await pool.query("SELECT MAX(ID) AS maxID FROM Persons");
    const maxID = rows[0].maxID;
    await pool.query("UPDATE Persons SET ID = ? ", [maxID + 1]);
    return maxID;
  } catch (error) {
    console.error('Error in xml_name:', error);
    throw new Error('Failed to retrieve xml_name');
  }
}




// Function to get the max ID
const getMaxID = async () => {
  const [rows] = await pool.query("SELECT MAX(ID) AS maxID FROM Persons");
  return rows[0].maxID;
};


// Setup storage configuration for multer
const getStorage = (maxID) => {
  const uploadFolderLowRes = path.join('\\\\192.168.90.32\\Images\\', `${maxID}\\LowRes`);

  // Ensure the LowRes directory is created
  fs.mkdirSync(uploadFolderLowRes, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadFolderLowRes);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${maxID}_${file.originalname}`;
      cb(null, uniqueName);
    }
  });
};

const copyFilesToHighRes = async (maxID) => {
  const uploadFolderLowRes = path.join('\\\\192.168.90.32\\Images\\', `${maxID}\\LowRes`);
  const uploadFolderHighRes = path.join('\\\\192.168.90.32\\Images\\', `${maxID}\\HighRes`);

  // Ensure the HighRes directory is created
  fs.mkdirSync(uploadFolderHighRes, { recursive: true });

  // Read all files in the LowRes folder
  const files = await fs.promises.readdir(uploadFolderLowRes);

  // Copy each file to the HighRes folder
  for (const file of files) {
    const src = path.join(uploadFolderLowRes, file);
    const dest = path.join(uploadFolderHighRes, file);
    await fs.promises.copyFile(src, dest);
  }
};




// Controller function for handling image uploads
exports.imageUploadHandler = async (req, res) => {
  try {
    const maxID = await getMaxID();
    const storage = getStorage(maxID);
    const upload = multer({ storage }).array('images');

    // Upload to LowRes folder
    upload(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          console.error('Multer error:', err);
          return res.status(500).json({ error: 'Multer error occurred while uploading files to LowRes' });
        }
        console.error('Unknown error:', err);
        return res.status(500).json({ error: 'An unknown error occurred while uploading files to LowRes' });
      }

      try {
        // Copy files from LowRes to HighRes
        await copyFilesToHighRes(maxID);

        // Files uploaded successfully to both folders
        console.log('Files received:', req.files);
        return res.status(200).json({ message: 'Files uploaded successfully to both LowRes and HighRes', files: req.files });
      } catch (copyError) {
        console.error('Error copying files to HighRes:', copyError);
        return res.status(500).json({ error: 'Error copying files to HighRes' });
      }
    });
  } catch (error) {
    console.error('Error in upload handler:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



// exports.insertArticle = async (req, res) => {
//   const {
//     product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
//     Byline, Dateline, paragraph
//   } = req.body;

//   try {
//     const xmlNameValue = await xml_name(); // Retrieve the unique ID
//     const parent_object_id = xmlNameValue ;
//     const query = `
//       INSERT INTO news_details_new (
//         xml_name, parent_object_id, Product, desk_type, Zone_Code, Created_user, Page_name, tagline, HeadKicker, Head, HeadDeck,
//         byline, dateline, content
//       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [
//       xmlNameValue, parent_object_id, product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
//       Byline, Dateline, encodeToBase64(paragraph)
//     ];

//     console.log("values:", values);

//     const [result] = await pool.execute(query, values);

//     console.log('Insert result:', result);
//     res.status(200).json({ message: 'Article inserted successfully' });
//   } catch (error) {
//     console.error('Error inserting article:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



exports.getProducts = async (req, res) => {
  try {
    const [rows, fields] = await pool.query('SELECT * FROM mas_product WHERE status = "A" ');
    res.json(rows);

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getLayouts = async (req, res) => {
  try {
    const { productName } = req.body;

    // Mapping of product names to product IDs
    const productIdMapping = {
      "Ananda Jothi": "TAMAnand",
      "Ilamai Puthumai": "TAMIlamai",
      "Hindu Tamil Thisai": "TAMILTH",
      "Impose Kalanjiam": "TAMImposeKalanjiam",
      "Imposition Penn Indru": "TAMImposePenn",
      "Kalanjiam": "TAMKalanjiam",
      "Tamkamadhenu": "TAMKam",
      "Mayabazzar": "TAMMaya",
      "Nalam Vazha": "TAMNalam",
      "Penn Indru": "TAMPenn",
      "Poster": "TAMPoster",
      "Hindu Talkies": "TAMTalky",
      "TAMTHAF": "TAMTHAF",
      "TAMTHEF": "TAMTHEF",
      "Vaniga Veethi": "TAMVani",
      "Sontha Veedu": "TAMVeedu",
      "TAMIL VETRIKODI": "TAMVKIS"
    };

    // Retrieve the product ID based on the product name
    const productId = productIdMapping[productName];

    if (!productId) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const query = `
      SELECT DISTINCT n.desk_name
      FROM desk_m n
      WHERE PRODUCT_ID = ? AND ACTIVE_STATUS = 'A'
      ORDER BY desk_name
    `;

    const [rows] = await pool.query(query, [productId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.getZone = async (req, res) => {
  try {
    const [rows, fields] = await pool.query(' SELECT m.Zone_Code, m.Zone_Name FROM mas_zone m where Zone_Code<>"ALL" ');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





exports.assignUser = async (req, res) => {
  try {
    const { zoneName } = req.body;
    if (!zoneName) {
      return res.status(404).json({ error: 'User not found' });
    }

    const query = `SELECT u.User_name ,u.Group_Code
    FROM mas_user u
    JOIN mas_zone z ON u.Zone_Code = z.Zone_Code
    WHERE z.Zone_Name = ? And u.Status='A' `;

    const [rows] = await pool.query(query, [zoneName]);
    res.json(rows);

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getPageNumber = async (req, res) => {
  try {
    const { deskName } = req.body;
    if (!deskName) {
      return res.status(400).json({ error: 'deskName is required' });
    }

    const query = `SELECT d.page_id FROM desk_page_id_mas d 
                   WHERE PAGE_ID <> '' AND desk LIKE ? 
                   ORDER BY page_id`;

    const [rows] = await pool.query(query, [`%${deskName}%`]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching page numbers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



// Insert Article
exports.insertArticle = async (req, res) => {
  const {
    product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, finalCaption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User,Assigned_USER,SP_Sub_Editor
  } = req.body;
 
  console.log("Received insert values:", {
    product, layout, zone, storyto, pagename, Storyname, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, finalCaption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User,Assigned_USER,SP_Sub_Editor
  });
 
  try {
    const xmlNameValue = await xml_name();
    const parentid = xmlNameValue;
    console.log(parentid);
    const productId = product;
   
    const zoneCode = await Zone_Code(zone);
    console.log(zoneCode);
    const userId = await User_Id(storyto);
    console.log(userId);
 
    console.log("Image Filename :",filenames);
    const ImageCaptionvalue = await ImageCaption(filenames, finalCaption, parentid);
    console.log("Final Image formation tag:",ImageCaptionvalue);
 
    // if (!productId || !zoneCode || !userId) {
    //   return res.status(400).json({ error: 'Invalid product, zone, or user' });
    // }
 
    let TotalXml = "";
 
    const addXmlTag = (tag, value) => {
      TotalXml += `<${tag}><span>${value ? value.trim() : ""}</span></${tag}>`;
    };
 
    addXmlTag("head_kicker", HeadKicker);
    addXmlTag("head", Head);
    addXmlTag("head_deck", HeadDesk);
    addXmlTag("byline", Byline);
    addXmlTag("Dateline", Dateline);
    addXmlTag("body", paragraph);
 
    TotalXml += ImageCaptionvalue;
    console.log("TotalXml :",TotalXml);
    TotalXml = encodeToBase64(TotalXml);
 
    // Interpolate values into the query string for debugging
    const query = `
      INSERT INTO news_details_new (
        xml_name, bkp_xml_folder_date, xml_exported_dateTime, parent_object_id, Product, desk_type, Zone_Code,
        Created_user, Page_name, Ref_story_name, HeadKicker, Head, HeadDeck, byline, dateline, content,
        ArticleType, news_owner, xml_parent_action, Article_Placed, quot_avail, IsPrint, IsWeb, Status,
        IssueDate, Publication_Date,
        Images, Image_path, caption, Image_Name, Total_Xml, Articles_Created, ArticleCreatedUser, Image_Type,
        Chief_Report_User, Editorial_User, Report_User,Assigned_USER
      ) VALUES (
        '${xmlNameValue}', SYSDATE(), SYSDATE(), '${parentid}', '${productId}', '${layout}', '${zoneCode}',
        '${ArticleCreatedUser}', '${pagename}', '${Storyname}', '${encodeToBase64(HeadKicker)}', '${encodeToBase64(Head)}','${encodeToBase64(HeadDesk)}', '${encodeToBase64(Byline)}', '${encodeToBase64(Dateline)}', '${encodeToBase64(paragraph)}',
        'RE', 'TheHindu', '${xml_parent_action}', 'N', 'N', 'Y', 'Y', '${Status}',
        DATE_ADD(CURDATE(), INTERVAL 1 DAY),DATE_ADD(CURDATE(), INTERVAL 1 DAY),
        '${filenames}', '${path}', '${encodeToBase64(finalCaption)}', '${filenames}', '${TotalXml}',
        '${ArticleCreatedUser}', '${ArticleCreatedUser}', 'RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~RGB~RGBRGB~RGB~',
        '${Chief_Report_User}', '${Editorial_User}', '${Report_User}','${Assigned_USER}'
      )
    `;
 
    // Log the query with values interpolated
    console.log("Query with interpolated values:", query);
 
    const [result] = await pool.execute(query);
    console.log('Insert result:', result);
 
    res.status(200).json({ message: 'Article inserted successfully' });
  } catch (error) {
    console.error('Error inserting article news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.updateArticle = async (req,res) => {
  const {
    xml_name, layout, zone, storyto, pagename, Ref_story_name, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, caption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User,product,IssueDate,finalCaption,
    SP_Editor,Assigned_USER,SP_Sub_Editor
  } = req.body;

  console.log("Received update values:", {
    product, layout, zone, storyto, pagename, Ref_story_name, HeadKicker, Head, HeadDesk,
    Byline, Dateline, paragraph, filenames, path, caption, xml_parent_action, Status,
    ArticleCreatedUser, Chief_Report_User, Editorial_User, Report_User,IssueDate,finalCaption,
    SP_Editor,Assigned_USER,SP_Sub_Editor
  });

  try {

    const productId = product;    
    const zoneCode = await Zone_Code(zone);
    const userId = await User_Id(storyto);

   const finalCaptionString = Array.isArray(finalCaption) ? finalCaption.join(' ') : finalCaption;
   console.log("finalCaptionString",finalCaptionString);

   const updateCaption = (finalCaptionString && finalCaptionString.trim() !== "") ? finalCaptionString : caption;

    const ImageCaptionvalue = await ImageCaption(filenames, updateCaption, xml_name);


    let TotalXml = "";

    const addXmlTag = (tag, value) => {
      TotalXml += `<${tag}><span>${value ? value.trim() : ""}</span></${tag}>`;
    };

    addXmlTag("head_kicker", HeadKicker);
    addXmlTag("head", Head);
    addXmlTag("head_deck", HeadDesk);
    addXmlTag("byline", Byline);
    addXmlTag("Dateline", Dateline);
    addXmlTag("body", paragraph);

    TotalXml += ImageCaptionvalue;

    console.log("TotalXml :",TotalXml);
    TotalXml = encodeToBase64(TotalXml);


// Interpolate values into the query string for debugging
const query = `
  UPDATE news_details_new 
  SET 
    Product = '${productId}', 
    desk_type = '${layout}', 
    Zone_Code = '${zoneCode}', 
    Created_user = '${ArticleCreatedUser}', 
    Page_name = '${pagename}', 
    Ref_story_name = '${Ref_story_name}', 
    HeadKicker = '${encodeToBase64(HeadKicker)}', 
    Head = '${encodeToBase64(Head)}',
    HeadDeck = '${encodeToBase64(HeadDesk)}', 
    byline = '${encodeToBase64(Byline)}', 
    dateline = '${encodeToBase64(Dateline)}', 
    content = '${encodeToBase64(paragraph)}',  
    xml_parent_action = '${xml_parent_action}', 
    Status = '${Status}', 
    caption = '${encodeToBase64(updateCaption)}', 
    Total_Xml = '${TotalXml}', 
    Articles_Created = '${ArticleCreatedUser}', 
    ArticleCreatedUser = '${ArticleCreatedUser}', 
    Chief_Report_User = '${Chief_Report_User}', 
    Editorial_User = '${Editorial_User}', 
    Report_User = '${Report_User}',
    SP_Editor ='${SP_Editor}',
    Assigned_USER='${Assigned_USER}',
    SP_Sub_Editor='${SP_Sub_Editor}'
    
    WHERE 
    IssueDate = '${IssueDate}' And xml_name = '${xml_name}'
`;

    // Log the query with values interpolated
    console.log("Query with interpolated values:", query);

    const [result] = await pool.execute(query);
    console.log('update result:', result);

    res.status(200).json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error inserting article news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}



exports.getNewsById = async (req, res) => {
  const { newsid, issuedate } = req.body;
  console.log(newsid);

  try {
    // Fetch only necessary columns and add pagination
    const query = `SELECT * FROM news_details_new WHERE parent_object_id = ? AND IssueDate = ?`;
    const [rows] = await pool.query(query, [newsid, issuedate]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    // List of fields that need to be decoded
    const fieldsToDecode = ['Total_Xml', 'HeadKicker', 'Head', 'HeadDeck', 'byline', 'dateline', 'content', 'caption'];

    // Decode specified Base64 encoded fields in each row
    const decodedRows = rows.map(row => {
      const decodedRow = { ...row }; // Copy original row
      fieldsToDecode.forEach(field => {
        if (row[field] && isBase64(row[field])) {
          decodedRow[field] = decodeFromBase64(row[field]);
        }
      });
      return decodedRow;
    });

    res.json(decodedRows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.getImageName = async (req, res) => {
  try {
    const folderName = await getMaxID();
    console.log('Folder Name:', folderName);
    const input_folder = path.join(`\\\\192.168.90.32\\Images\\${folderName}\\LowRes`);
    const folder_path = `Images//${folderName}//LowRes/`;

    // Check if the directory exists
    if (!fs.existsSync(input_folder)) {
      return res.status(200).json({ message: 'Folder does not exist', filenames: '', path: folder_path });
    }

    // Read the files in the folder
    fs.readdir(input_folder, (err, files) => {
      if (err) {
        console.error('Error reading folder:', err);
        return res.status(500).json({ error: 'Error reading folder' });
      }

      if (files.length === 0) {
        return res.status(200).json({ message: 'Images not exist', filenames: '', path: folder_path });
      }

      // Combine filenames using ~ if there's more than one file
      let fileres = files.length > 1 ? files.join("~") : files[0] || "";

      // Send the list of filenames in the folder
      console.log('Filenames:', fileres);
      return res.status(200).json({ filenames: fileres, path: folder_path });
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.fetchnews = async (req, res) => {
  const { selectedDate, product, zone, layout, pagename } = req.body;

  try {
    const productid = await product_Id(product);
    const zonecode = await Zone_Code(zone);

    // Check if productid and zonecode are valid
    if (!productid || !zonecode) {
      return res.status(404).json({ error: 'Invalid product or zone' });
    }

    const query = `SELECT * FROM news_details_new WHERE IssueDate = ? AND Product = ? AND Zone_Code = ? AND desk_type = ? `;
    const [rows] = await pool.query(query, [selectedDate, product, zonecode, layout]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    // Decode Base64 encoded fields in each row
    const decodedRows = rows.map(row => {
      const decodedRow = {};
      for (let key in row) {
        if (typeof row[key] === 'string' && isBase64(row[key])) {
          decodedRow[key] = decodeFromBase64(row[key]);
        } else {
          decodedRow[key] = row[key];
        }
      }
      return decodedRow;
    });

    res.json(decodedRows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.fetchrevokepage = async (req, res) => {
  const { issueDate, zoneId, productId } = req.body;
  console.log();
  try {

    if (!issueDate || !productId || !zoneId) {
      return res.status(400).json({ error: 'Date, Product ID, and Zone ID are required' });
    }

    const query = `SELECT * FROM page_compose where Issue_Dt = ? and Zone_id = ? and  Product_id = ?`;
    const [rows] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(rows);
    console.log(rows);

  } catch (error) {
    console.log(error);
  }
}



exports.userdetail = async (req, res) => {
  const { User_Id } = req.body;
  console.log(User_Id);
  try {
    if (!User_Id) {
      return res.status(400).json({ error: 'User_Id is not found' });
    }

    const query = `SELECT * FROM mas_user WHERE User_id = ?`;
    const [rows, fields] = await pool.query(query, [User_Id]); // Use await here to wait for the query to complete

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]); // Assuming you expect only one row, returning the first row
  } catch (error) {
    console.error('Error in userdetail:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.adAuth = async (req,res) =>{
  try {
    // Access the request body
    const formData = req.body;
    const formDataJSON = JSON.stringify(formData);
    console.log(formData);

    if (formData !== null) {
      const redirectURL = `http://192.168.90.139:3000/user?formData=${encodeURIComponent(formDataJSON)}`;
      return res.redirect(redirectURL);
    }
   
    console.log(formDataJSON);

    res.json({ message: 'Form data received successfully', formData: formDataJSON });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}






//-------------Thumbnail api's ----------------------

exports.productids = async (req, res) => {
  const issueDate = req.query.date;
 
  if (!issueDate) {
    return res.status(400).json({ error: "Date is required" });
  }
 
  const query = `
    SELECT DISTINCT PRODUCT_ID
    FROM plan_hdr
    WHERE ISSUE_DT = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 
exports.zoneIdsByProduct = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
 
  console.log("Received request with date:", issueDate, "and productId:", productId);
 
  if (!issueDate || !productId) {
    return res.status(400).json({ error: "Date and Product ID are required" });
  }
 
  const query = `
    SELECT DISTINCT ZONE_ID
    FROM plan_hdr
    WHERE ISSUE_DT = ? AND PRODUCT_ID = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};
 
exports.editionId = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
 
  console.log("Received request with date:", issueDate, "and productId:", productId);
 
  if (!issueDate || !productId) {
    return res.status(400).json({ error: "Date and Product ID are required" });
  }
 
  const query = `
    SELECT DISTINCT EDITION_ID
    FROM plan_hdr
    WHERE ISSUE_DT = ? AND PRODUCT_ID = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};
 
exports.pagesZones = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
  const zoneId = req.query.zoneId;
 
  console.log("Received request with date:", issueDate, "productId:", productId, "zoneId:", zoneId);
 
  if (!issueDate || !productId || !zoneId) {
    return res
      .status(400)
      .json({ error: "Date, Product ID, and Zone ID are required" });
  }
 
  const query = `
    SELECT DISTINCT p.Page_id, h.Zone_id
    FROM plan_hdr AS h
    INNER JOIN plan_page AS p ON h.Plan_id = p.Plan_id
    WHERE h.ISSUE_DT = ?
      AND h.Zone_id = ?
      AND h.Product_id = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};
 
exports.pagesWithoutZones = async (req, res) => {
  const issueDate = req.query.date;
  const productId = req.query.productId;
 
  console.log("Received request with date:", issueDate, "and productId:", productId);
 
  if (!issueDate || !productId) {
    return res
      .status(400)
      .json({ error: "Date and Product ID are required" });
  }
 
  const query = `
    SELECT DISTINCT Page_Name
    FROM page_compose p
    WHERE Issue_DT = ?
      AND Product_Id = ?
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};
 
exports.getImages = async (req, res) => {
  const { date, zone, product, page, edition } = req.query;
 
  console.log("Received request with date:", date, ", zone:", zone, ", product:", product, ", page:", page, ", and edition:", edition);
 
  if (!date || !zone || !product || !page || !edition) {
    return res.status(400).json({ error: "Date, Zone, Product, Page, and Edition are required" });
  }
 
  const filePath = path.join("\\\\192.168.90.32\\EditorialImage\\Image_Preview", date, zone, `${product}_${date}_${zone}_${edition}_${page}.jpg`);
 
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    const stats = await fs.promises.stat(filePath);
    const modifiedDate = stats.mtime; // Modified date of the file
    res.sendFile(filePath, { headers: { "Content-Type": "image/jpeg" } });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: "Image not found" });
    } else {
      res.status(500).json({ error: "Failed to access the file" });
    }
  }
};
exports.getPdf = async (req, res) => {
  const { date, zone, product, page, edition } = req.query;
 
  console.log("Received request with date:", date, ", zone:", zone, ", product:", product, ", page:", page, ", and edition:", edition);
 
  if (!date || !zone || !product || !page || !edition) {
    return res.status(400).json({ error: "Date, Zone, Product, Page, and Edition are required" });
  }
 
  const filePath = path.join("\\\\192.168.90.32\\EditorialImage\\Image_Preview", date, zone, `${product}_${date}_${zone}_${edition}_${page}.pdf`);
 
  console.log(filePath);
 
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    res.sendFile(filePath, { headers: { "Content-Type": "application/pdf" } });
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: "PDF not found" });
    } else {
      res.status(500).json({ error: "Failed to access the file" });
    }
  }
};
 
exports.getPlanData = async (req, res) => {
  const issueDate = req.query.date;
  const zoneId = req.query.zoneId;
  const productId = req.query.productId;
 
  //console.log("Received request with date:", issueDate, ", zoneId:", zoneId, ", and productId:", productId);
 
  if (!issueDate || !zoneId || !productId) {
    return res.status(400).json({ error: "Date, Zone ID, and Product ID are required" });
  }
 
  const query = `
    SELECT Page_Name, Page_No
    FROM page_compose
    WHERE Issue_Dt = ? AND Zone_id = ? AND Product_id = ? ORDER BY Page_No + 0;
  `;
 
  try {
    const [results] = await pool.query(query, [issueDate, zoneId, productId]);
    res.json(results);
  } catch (error) {
    console.error("Database query failed:", error);
    res.status(500).json({ error: error.message });
  }
};

//---------------------------Article user api

exports.articleuserids = async (req, res) => {
  
  const query = `
    SELECT User_ID, User_name FROM mas_user m;
  `;
 
  try {
    const [results] = await pool.query(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



//-------------Revoke Api ---------------


// Get Plan ID
async function getPlanId(issueDate, productId, zoneId) {
  try {
    console.log("Function calling :",issueDate, productId, zoneId);
   
    const query = 'SELECT a.plan_id FROM plan_hdr a WHERE a.issue_dt = ? AND a.Product_ID = ? AND a.ZONE_ID = ?';
    const [rows] = await pool.query(query, [issueDate, productId, zoneId]);
   
    console.log("Query result:", rows);
   
    if (rows.length > 0) {
      // console.log("Plan ID:", rows[0].plan_id);
      return rows[0].plan_id; // Return the plan_id from the first row
    } else {
      console.log("No plan ID found for the given parameters");
      return null; // Return null if no plan_id is found
    }
  } catch (error) {
    console.error('Error fetching Plan Id:', error);
    throw new Error('Failed to retrieve Plan_Id');
  }
}

exports.fetchrevokepage = async (req, res) =>{
  const {issueDate,zoneId,productId} = req.body ;
  console.log(issueDate,zoneId,productId);
try {
 
  if (!issueDate || !productId || !zoneId) {
    return res.status(400).json({ error: 'Date, Product ID, and Zone ID are required' });
  }
 
  const query = `SELECT * FROM page_compose where Issue_Dt = ? and Zone_id = ? and  Product_id = ?`;    
  const [rows] = await pool.query(query, [issueDate, zoneId, productId]);
  res.json(rows);
  console.log(rows);
 
} catch (error) {
  console.log(error);
}
}
  
 
exports.updatePageCompose = async (req, res) => {
  const { issueDate, zoneId, productId, pageName, newStatus, newNoOfRevokes } = req.body;
  console.log("Update value:", issueDate, zoneId, productId, pageName, newStatus, newNoOfRevokes);
  const planid = await getPlanId(issueDate, productId, zoneId);
  console.log("planid",planid);
 
  try {
    if (!issueDate || !productId || !zoneId || !pageName || !newStatus || !newNoOfRevokes) {
      return res.status(400).json({ error: 'Date, Product ID, Zone ID, Page Name, Status, and No of Revokes are required' });
    }
 
 
    if (!planid) {
      return res.status(404).json({ error: 'Plan ID not found' });
    }
 
    const query = `
      UPDATE page_compose
      SET Status = ?,
          No_of_Revokes = No_of_Revokes + ?
      WHERE Issue_Dt = ?
        AND Zone_id = ?
        AND Product_id = ?
        AND Page_Name = ?
    `;
    const [result1] = await pool.query(query, [newStatus, newNoOfRevokes, issueDate, zoneId, productId, pageName]);
    console.log(`Updated ${result1.affectedRows} row(s) in page_compose`);
 
    const query1 = 'UPDATE plan_page SET STATUS = ?  WHERE Plan_ID = ? AND Page_id = ?'
    const [result2] = await pool.query(query1, ['Editorial Release', planid, pageName]);
    console.log(`Updated ${result2.affectedRows} row(s) in plan_page`);
 
    res.status(200).json({
      message: `Updated ${result1.affectedRows} row(s) in page_compose and ${result2.affectedRows} row(s) in plan_page`
    });
  } catch (error) {
    console.error('Error updating page_compose or plan_page:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};