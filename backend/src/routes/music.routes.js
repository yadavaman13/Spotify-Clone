const express = require('express');
const musicController = require('../controllers/music.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage()
});

const router = express.Router();

router.post('/createmusic', authMiddleware.authArtist , upload.single("music") , musicController.createMusic);
router.post('/createalbum', authMiddleware.authArtist , musicController.createAlbum);

router.get('/', authMiddleware.authUser , musicController.getAllMusics);
router.get('/albums', musicController.getAllAlbums);
router.get('/albums/:albumId', authMiddleware.authUser , musicController.getAlbumById);

module.exports = router;