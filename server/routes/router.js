// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();

const Controller = require('../Controller/controller');

router.get('/getproducts', Controller.getProducts);
router.post('/product_name_api', Controller.product_name_api);

router.post('/getlayouts', Controller.getLayouts);

router.get('/getzone',Controller.getZone);
router.post('/Zone_name_api',Controller.Zone_Name_api);

router.post('/pagenumber',Controller.getPageNumber);

router.post('/assignuser',Controller.assignUser);
router.post('/assignuser',Controller.User_Id_api);

router.post('/uploadImages',Controller.imageUploadHandler)
router.post('/insertArticle',Controller.insertArticle)
router.post('/updateArticle',Controller.updateArticle)
router.post('/fetchnews/id',Controller.getNewsById)
router.get('/getImageName', Controller.getImageName)
router.post('/fetchnews', Controller.fetchnews)
router.post('/revokepage', Controller.fetchrevokepage)
router.post('/getUser', Controller.userdetail)
router.post('/user', Controller.adAuth)


//-----------Thumbnail  Api -------------------
router.get('/reporter/products-ids',Controller.productids)
router.get('/reporter/zone-ids-by-product', Controller.zoneIdsByProduct);
router.get('/reporter/edition-id', Controller.editionId);
router.get('/reporter/pages-zones', Controller.pagesZones);
router.get('/reporter/pages-withoutzones', Controller.pagesWithoutZones);
router.get('/reporter/images', Controller.getImages);
router.get('/reporter/pdf', Controller.getPdf);
router.get('/reporter/plandata', Controller.getPlanData);
//------------------Article User----------

router.get('/article/articleuserids', Controller.articleuserids);
router.get('/article/userfilterdetail', Controller.userfilterdetail);



//-------------Revoke Api ---------------

router.post('/revokePagez',Controller.fetchrevokepage)
router.post('/updaterevoke',Controller.updatePageCompose)



module.exports = router;
