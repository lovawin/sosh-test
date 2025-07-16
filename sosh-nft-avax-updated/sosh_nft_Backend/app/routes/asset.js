const router = require('express').Router();
const Asset = require('../controllers/asset.controller');
const { bearerUserFetch } = require('../middleware/user');

// middleware
const { requesterShouldBeOwnerOfTheAsset } = require('../middleware/validator.middleware');

// instance of the controllers
const asset = new Asset();

// routes;
router.get('/searchAssets/search', bearerUserFetch, asset.searchAssets);
router.get('/auction', asset.getNftBid);
router.get('/:id', bearerUserFetch, asset.getOneAsset);
router.get('/owner/:ownerid', bearerUserFetch, asset.getAllAssetOfOwner);
router.put('/:id', [requesterShouldBeOwnerOfTheAsset], asset.getOneAssetAndUpdate);
router.get('/', bearerUserFetch, asset.getAllAssets);
router.post('/:id/like', asset.likeAsset);
router.post('/', asset.create);
router.delete('/:assetId/deleteAsset', asset.deleteAsset);
router.post('/saleCreated', asset.saleCreated);
router.post('/placeBid', asset.placeBid);
router.post('/purchaseNFT', asset.purchaseNFT);

module.exports = router;
