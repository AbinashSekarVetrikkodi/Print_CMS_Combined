const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Routes = require('./routes/router');
const { createProxyMiddleware } = require('http-proxy-middleware'); // Correct import statement
const axios = require ('axios');
const session = require('express-session');


const app = express();
const port = process.env.PORT || 3800;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));





// app.post('/redirectToAuth', (req, res) => {
//   const { returnUrl, encodeUrl } = req.body;
//   console.log(returnUrl, encodeUrl);
//   if (returnUrl && encodeUrl) {
//     res.json({ redirectUrl: returnUrl });
//     res.redirect(`https://auth.kslmedia.in/index.php?return=${encodeUrl}`);

//   } else {
//     res.status(400).json({ error: 'No returnUrl or encodeUrl provided' });
//   }
// });






app.post('/user', (req, res) => {
  try {
    // Access the request body
    const formData = req.body;
    const formDataJSON = JSON.stringify(formData);
    console.log(formData);

    if (formData !== null) {
      const redirectURL = `http://192.168.90.137:3000/user?formData=${encodeURIComponent(formDataJSON)}`;
      return res.redirect(redirectURL);
    }
   
    console.log(formDataJSON);

    res.json({ message: 'Form data received successfully', formData: formDataJSON });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Routes
app.use('/api', Routes);

app.get('/',(req,res)=>{
  res.send('welcome')
})

// Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
