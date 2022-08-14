'use strict'
var fs = require('fs');
var path = require('path');

const { PlayList, User, Album, Artist, Song } = require('../database');
const PlayListController = {};

/**
 * @api {get} /playlist/addPlaylist Muestra la vista de agregar Playlist.
 * @apiName viewAddPlaylist
 * @apiGroup Playlist
 * @apiDescription El método renderiza la vista de agregar Playlist.
 * 
 * @apiSuccess {html} Carga un archivo html con toda la informacion necesaria en la vista. 
 * 
 */
PlayListController.viewAddPlaylist = (req, res) => {
  res.render("dashboard", { title: "Agregar Playlist", fragment: "fragments/playlist/addPlaylist" });
};
/**
 * @api {get} /playlist/myPlaylist Muestra la vista de las playlist que tiene el usuario
 * @apiName viewMyPlaylist
 * @apiGroup Playlist
 * @apiDescription El método renderiza la vista de playlist para mostrar las playlist del usuario
 * 
 * @apiSuccess {html} Carga un archivo html con toda la informacion necesaria en la vista. 
 * 
 */
PlayListController.viewMyPlaylist = (req, res) => {
  PlayList.findAll({
    where: {
      status: true,
      userId: req.params.user
    }
  }).then((list) => {
    res.render("dashboard", { title: "Mis Playlist", fragment: "fragments/playlist/myPlaylist", playlists: list });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ message: 'Error en la peticion' });
  });
};

/**
 * @api {get} /playlist/explore Muestra la vista de todas las playlist que tiene el usuario
 * @apiName viewExplore
 * @apiGroup Playlist
 * @apiDescription El método renderiza la vista de todas las playlist que tiene el usuario
 * 
 * @apiSuccess {html} Carga un archivo html con toda la informacion necesaria en la vista. 
 * 
 */
PlayListController.viewExplore = (req, res) => {
  User.findOne({
    where: { roleId: 1 }
  }).then((user) => {
    PlayList.findAll({
      where: { userId: user.id }
    }).then((list) => {
      res.render("dashboard", { title: "Mis Playlist", fragment: "fragments/playlist/explore", playlists: list });
    }).catch((err) => {
      console.log(err);
      res.status(500).send({ message: 'Error en la peticion' });
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ message: 'Error en la peticion' });
  });
};

/**
 * @api {get} /playlist/editPlaylist Muestra la vista de editar la playlist
 * @apiName viewEditPlaylist
 * @apiGroup Playlist
 * @apiDescription El método renderiza la vista de editar la playlist
 * 
 * @apiSuccess {html} Carga un archivo html con toda la informacion necesaria en la vista. 
 * 
 */
PlayListController.viewEditPlaylist = (req, res) => {
  PlayList.findOne({
    where: { external_id: req.params.external_id }
  }).then((playlist) => {

    Song.findAll({
      where: { status: true },
      order: ['title']
    }).then((list) => {
      res.render("dashboard", { title: "Editar Playlist", fragment: "fragments/playlist/editPlaylist", songs: list, playlist: playlist });
    }).catch((err) => {
      console.log(err);
      res.status(500).send({ message: 'Error en la peticion' });
    });

  }).catch((err) => {
    console.log(err);
    res.status(500).send({ message: 'Error en la peticion' });
  });
};

/**
 * @api {get} /playlist/details Muestra la vista de detalles de Playlist.
 * @apiName viewDetailsPlaylist
 * @apiGroup Playlist
 * @apiDescription El método renderiza la vista de detalles de Playlist.
 * 
 * @apiSuccess {html} Carga un archivo html con toda la informacion necesaria en la vista. 
 * 
 */
PlayListController.viewDetailsPlaylist = (req, res) => {
  PlayList.findOne({
    where: { external_id: req.params.external_id }
  }).then((playList) => {
    playList.getSongs()
      .then((list) => {
        res.render("dashboard", { title: "Detalles de Playlist", fragment: "fragments/playlist/details", songs: list, playlist: playList });
      }).catch((err) => {
        console.log(err);
        res.status(500).send({ message: 'Error en la peticion' });
      });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ message: 'Error en la peticion' });
  });
};


/**
 * @api {post} /playlist/savePlayList Guarda información de la playlist
 * @apiName savePlayList
 * @apiGroup playlist
 * @apiDescription El método guarda información de la playlist en la base de datos
 * 
 * @apiParam {String}           title             titulo de canción
 * @apiParam {String}           description       breve descripción de playlist
 * @apiParam {Number}           userId            el id de la persona a la que pertenece 
 *
 * 
 *  @apiParamExample {json} Request-Example:
 *      {
 *         title:"Playlist",
 *         description: "Playlist",
 *         number: 1
 *      }
 * 
 * @apiSuccess {flashNotification} pop up 'Se ha guardado la Playlist con éxito'
 * 
 */
PlayListController.savePlayList = (req, res) => {
  PlayList.create({
    title: req.body.title,
    description: req.body.description,
    status: true,
    image: 'playlist.jpg',
    userId: req.params.user
  }).then((playListStored) => {
    if (playListStored) {
      req.flash('GOOD', 'Se ha guardado la Playlist con éxito', "/playlist/addPlaylist");
    } else {
      req.flash('OK', 'No se pudo guardar la Playlist', "/playlist/addPlaylist");
    }
  }).catch((err) => {
    console.log(err);
    req.flash('BAD', 'Error al guardar la Playlist', "/playlist/addPlaylist");
  });
};

/**
 * @api {post} /playlist/addSongs Agrega una canción a la playlist
 * @apiName addSongtoPlayList
 * @apiGroup playlist
 * @apiDescription El método agrega una canción a la playlist en la base de datos
 * 
 * @apiParam {Number}           playlist         el id de la playlist
 * @apiParam {Number}           songs            arreglo de canciones que se agregan a la playlist
 *  
 * @apiParamExample {json} Request-Example:
 *      {
 *         playlist:1,
 *         songs: [{1},{2}]
 *      }
 * 
 * @apiSuccess {flashNotification} pop up 'Se ha agregado correctamente las canciones'
 * 
 */
PlayListController.addSongtoPlayList = (req, res) => {
  PlayList.findOne({
    where: { id: req.body.playlist }
  }).then((playListResult) => {
    playListResult.setSongs(req.body.songs);
    res.status(200).send('ok');
  }).catch((err) => {
    console.log(err);
    res.status(500).send("error");
  });
};

/**
 * @api {get} /playlist/getPlayList Obtiene un solo registro de la playlist
 * @apiName getPlayList
 * @apiGroup playlist
 * @apiDescription El método obtiene un solo registro  de la playlist en la base de datos
 * 
 * @apiParam {Number}           external            el atributo external_id de la playlist.Se obtiene por la URL. 
 *
 * @apiSuccess {json} playlist
 * @apiSuccessExample Sucess-Response:
 * HTTP/1.1 200 OK
 *  {
 *    id_playlist:1,
 *    title:"titulo de la playlist",
 *    image:"gfsgsfbdsbdfb.jpg",
 *    description:"descripcion de la playlist",
 *    status: true,
 *    external_id: fjgfljglksfgkfgfkl
 *  }
 * 
 */
PlayListController.getPlayList = (req, res) => {
  PlayList.findOne({
    where: { external_id: req.params.external }
  }).then((playList) => {
    res.status(200).send(playList);
  }).catch((err) => {
    res.status(500).send({ message: 'Error en la peticion' });
  });
};
/**
 * @api {get} /playlist/playlistAdmin listar todas las playlist creadas por el administrador
 * @apiName getPlayListAdmin
 * @apiGroup playlist
 * @apiDescription El método lista todas las playlist en la base de datos creadas por el administrador
 * 
 * @apiSuccess {json} list
 * @apiSuccessExample Sucess-Response:
 * HTTP/1.1 200 OK
 *  [{
 *    id_playlist:1,
 *    title:"titulo de la playlist",
 *    image:"gfsgsfbdsbdfb.jpg",
 *    description:"descripcion de la playlist",
 *    status: true,
 *    external_id: fjgfljglksfgkfgfkl
 *  },
 *  {
 *    id_playlist:2,
 *    title:"titulo de la playlist 2",
 *    image:"gfsgsfbdsbdfb.jpg",
 *    description:"descripcion de la playlist 2",
 *    status: true,
 *    external_id: fjgfljglksfgkfgfkl
 *  }]
 */
PlayListController.getPlayListAdmin = (req, res) => {
  User.findOne({
    where: { roleId: 1 }
  }).then((user) => {
    PlayList.findAll({
      where: { userId: user.id }
    }).then((list) => {
      res.status(200).send(list);
    }).catch((err) => {
      console.log(err);
      res.status(500).send({ message: 'Error en la peticion' });
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ message: 'Error en la peticion' });
  });
};
/**
 * @api {post} /playlist/ranking Crea un ranking con las canciones mas escuchadas
 * @apiName createPlaylistRanking 
 * @apiGroup playlist
 * @apiDescription El método crea un ranking con las canciones mas escuchadas en la base de datos
 * 
 * @apiSuccess {flashNotification} pop up 'Se ha agregado correctamente las canciones'
 * 
 */
PlayListController.createPlaylistRanking = (req, res) => {
  PlayList.findOne({
    where: { title: "Más Escuchadas" }
  }).then((playlist) => {
    if (playlist) {
      Song.findAll({
        where: { status: true },
        order: [["listeners", "DESC"]],
        limit: 25
      }).then((list) => {
        playlist.setSongs(list);
        req.flash('GOOD', 'Se ha creado correctamente la playlist ranking', "/playlist/addPlaylist");
      }).catch((err) => {
        console.log(err);
        res.status(500).send({ message: 'Error en la peticion' });
      });
    } else {
      PlayList.create({
        title: "Más Escuchadas",
        description: "Las 25 canciones más escuchadas de la plataforma",
        status: true,
        image: 'playlist.jpg',
        userId: req.params.user
      }).then((playListStored) => {
        if (playListStored) {
          Song.findAll({
            where: { status: true },
            order: [['listeners', 'DESC']],
            limit: 25
          }).then((list) => {
            playListStored.setSongs(list);
            req.flash('GOOD', 'Se ha creado correctamente la playlist ranking', "/playlist/addPlaylist");
          }).catch((err) => {
            console.log(err);
            res.status(500).send({ message: 'Error en la peticion' });
          });
        } else {
          req.flash('OK', 'No se pudo crear la Playlist', "/playlist/addPlaylist");
        }
      }).catch((err) => {
        console.log(err);
        req.flash('BAD', 'Error al guardar la Playlist', "/playlist/addPlaylist");
      });
    }
  }).catch((err) => {
    console.log(err);
    req.flash('BAD', 'Error al guardar la Playlist', "/playlist/addPlaylist");
  });
};
/**
 * @api {get} /playlist/songsList Lista las canciones del rankings de la playlist
 * @apiName getListSongs
 * @apiGroup playlist
 * @apiDescription El método Lista las canciones del rankings de la playlist en la base de datos
 * 
 * @apiParam {String}           playlist            el atributo external_id de la playlist 
 *
 * @apiSuccessExample {json} list
 * @apiSuccessExample Sucess-Response:
 * HTTP/1.1 200 OK
 *    [{
 *    id_song:1,
 *    number:1,
 *    title:"titulo cancion",
 *    file:"archivo.mp3",
 *    status: true,
 *    listerners: 1,
 *    external_id:gskfgfjlgf 
 *  },
 *  {
 *    id_song:1,
 *    number:1,
 *    title:"titulo cancion",
 *    file:"archivo.mp3",
 *    status: true,
 *    listerners: 1,
 *    external_id:gskfgfjlgf 
 *  }]
 */
PlayListController.getListSongs = (req, res) => {
  PlayList.findOne({
    where: { external_id: req.params.playlist }
  }).then((playList) => {
    playList.getSongs({
      include: [{ model: Album, attributes: ['image', 'title'], include: { model: Artist, attributes: ['name'] } }]
    })
      .then((list) => {
        res.status(200).send(list);
      }).catch((err) => {
        console.log(err);
        res.status(500).send({ message: 'Error en la peticion' });
      });
  }).catch((err) => {
    console.log(err);
    res.status(500).send({ message: 'Error en la peticion' });
  });
};
/**
 * @api {get} /playlist/playLists Lista todas las playlist disponibles
 * @apiName getplayLists
 * @apiGroup playlist
 * @apiDescription El método lista todas las playlist disponibles en la base de datos
 * 
 * @apiParam {Number}           user            el id del usuario
 * 
 * @apiSuccess {json} list
 * @apiSuccessExample Sucess-Response:
 * HTTP/1.1 200 OK
 *  [{
 *    id_playlist:1,
 *    title:"titulo de la playlist",
 *    image:"gfsgsfbdsbdfb.jpg",
 *    description:"descripcion de la playlist",
 *    status: true,
 *    external_id: fjgfljglksfgkfgfkl
 *  },
 *  {
 *    id_playlist:2,
 *    title:"titulo de la playlist 2",
 *    image:"gfsgsfbdsbdfb.jpg",
 *    description:"descripcion de la playlist 2",
 *    status: true,
 *    external_id: fjgfljglksfgkfgfkl
 *  }]
 */
PlayListController.getPlayLists = (req, res) => {
  PlayList.findAll({
    where: {
      status: true,
      userId: req.params.user
    }
  }).then((list) => {
    res.status(200).send(list);
  }).catch((err) => {
    res.status(500).send({ message: 'Error en la peticion' });
  });
};

/**
 * @api {post} /playlist/upload-image-playList Actualiza el atributo image de playlist en la base de datos.
 * @apiName uploadImage
 * @apiGroup playlist
 * @apiDescription El método actualiza el atributo image con la ruta de la imagen subida en la base de datos.
 * 
 * @apiParam {String}           image               Atributo image que llega del formulario form multipart/form-data.
 * @apiParamExample {json} Request-Example:
 *      {
 *         image:AyLjYZwe-HzZ08Yh0Vsiq7An.png
 *      }
 * 
 * @apiSuccess {flashNotification} pop up 'Se ha subido la Imagen de la playlist con éxito'
 * 
 */
PlayListController.uploadImage = (req, res) => {
  var file_name = "Imagen no encontrada";

  if (req.files) {
    var file_path = req.files.image.path;
    if (process.platform == 'darwin') {
      var file_split = file_path.split('\/');
    } else {
      var file_split = file_path.split('\\');
    }
    var file_name = file_split[2];

    var ext_split = file_name.split('\.');
    var file_ext = ext_split[1];

    if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'gif') {
      PlayList.update({ image: file_name }, {
        where: { external_id: req.params.id }
      }).then((result) => {
        if (result == 0) {
          req.flash('OK', "No se ha podido actualizar la playlist");
        } else {
          req.flash('GOOD', "Se ha subido la Imagen de la playlist con éxito");
        }
      }).catch((err) => {
        res.status(500).send({ message: 'Error en la peticion' });
      });
    } else {
      req.flash('message', "La extension del archivo no es correcta");
      res.redirect('/profile');
    }
  } else {
    req.flash('message', "Ocurrio un error al intentar subir la imagen");
    res.redirect('/profile');
  }
};
/**
* @api {get} /playlist/get-image-playList Presenta la imagen de la playlist con una ruta
* @apiName getImageFile
* @apiGroup playlist
* @apiDescription El método presenta la imagen de la playlist con una ruta en la base de datos
* 
* @apiParam {String}           imageFile          el archivo de imagen 
*
*  @apiParamExample {json} Request-Example:
*      {
*         imageFile:"pZf0xvCSsl5hg0Wq9Yz-Lkoc.jpg"
*      }
*  
* @apiSuccessExample {file}  fotografia de la playlist que se encuentra en la base de datos y que se obtiene del servidor.
*/
PlayListController.getImageFile = (req, res) => {
  var imageFile = req.params.imageFile;
  var path_file = './uploads/playLists/' + imageFile;
  var default_file = './public/img/playlist.jpg';

  fs.exists(path_file, function (exists) {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      fs.exists(default_file, (exists) => {
        if (exists) {
          res.sendFile(path.resolve(default_file));
        } else {
          res.status(200).send({ message: "No existe la imagen" });
        }
      });
    }
  });

};


module.exports = PlayListController;