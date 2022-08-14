'use strict'

var express = require('express');
var router = express.Router();
var multipart = require('connect-multiparty');

const playListController = require('../controllers/playlist.controller');
const { isLoggedIn } = require('../lib/auth');
const md_upload = multipart({uploadDir: './uploads/playLists'});

//Vistas para la aplicacion web
router.get("/addPlaylist",isLoggedIn,playListController.viewAddPlaylist);
router.get("/myPlaylist/:user",isLoggedIn,playListController.viewMyPlaylist);
router.get("/explore",isLoggedIn,playListController.viewExplore);
router.get('/editPlaylist/:external_id',isLoggedIn,playListController.viewEditPlaylist);
router.get("/details/:external_id",isLoggedIn,playListController.viewDetailsPlaylist);

router.get('/playLists/:user',isLoggedIn,playListController.getPlayLists);
router.get('/playList/:external',isLoggedIn,playListController.getPlayList);
router.get('/songsList/:playlist',playListController.getListSongs);
router.get('/playlistAdmin',playListController.getPlayListAdmin);
router.post('/savePlayList/:user',isLoggedIn,playListController.savePlayList);
router.post('/upload-image-playList/:id',[isLoggedIn,md_upload],playListController.uploadImage);
router.post('/addSongs',isLoggedIn,playListController.addSongtoPlayList);
router.get('/get-image-playList/:imageFile', playListController.getImageFile);
router.post('/ranking/:user',playListController.createPlaylistRanking);

module.exports = router;