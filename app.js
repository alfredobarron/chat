//Conexion
var port = Number(process.env.PORT || 5000);
var express = require('express');
var mongoose = require('mongoose');
var app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);


//Express
server.listen(port);

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  //res.send('hello world');
  res.sendfile(__dirname + '/index.html');
});



//Mongoose
mongoose.connect('mongodb://localhost/chat');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  // yay!
});
// Mongoose Schema definition
var Schema = mongoose.Schema;
var mensajesdb = new Schema({
    to: String,
    from: String,
    msj: String,
    fecha: String
});
// Mongoose Model definition
var Mensaje = mongoose.model('mensajes', mensajesdb);



//Variables
var nicknames = [];
var historial = [];



//Socketio
//Cuando entran a la app
io.sockets.on('connection', function (socket) {

  //Cuando entra un usuario a la app
  socket.on('nickname', function(data, callback) {
    if(nicknames.indexOf(data) != -1){
      callback(false);
    }else{
      callback(true);
      socket.join(data);
      nicknames.push(data);
      socket.nickname = data;
      io.sockets.emit('nicknames', nicknames);
      cargaHistorialChat('Chat');
    }
  });

  socket.on('chat', function () {
    cargaHistorialChat('Chat');
  });

  //Cuando se entra a un room
  socket.on('private', function (data) {
    cargaHistorial(data,socket.nickname);
  });

  //Fincion cargar historial
  function cargaHistorialChat(room){
    //socket.join(data.user); // We are using room of socket io
    Mensaje.find({ to: room }, function (err, docs) {
      //historial=docs;
      //io.sockets.emit('historial', historial);
      io.sockets.in(socket.nickname).emit('historial', {
        room: room,
        mensajes: docs
      });
    });
    //io.sockets.in(data).emit('private', {from:socket.nickname, msj: 'hello'});
  }
  //Fincion cargar historial
  function cargaHistorial(room,from){
    //socket.join(data.user); // We are using room of socket io
    //Mensaje.find({ to:room, from:from }, function (err, docs) {
    Mensaje.find( { $or:[ { to:room, from:from }, { to:from, from:room} ] }, function (err, docs) {
      //historial=docs;
      //io.sockets.emit('historial', historial);
      io.sockets.in(from).emit('historial', {
        room: room,
        mensajes: docs
      });
    });
    //io.sockets.in(data).emit('private', {from:socket.nickname, msj: 'hello'});
  }

  //Cuando se recibe un mensaje
  socket.on('mensaje', function(data) {
    //io.sockets.socket(data.room).emit('mensaje', {
    if(data.room == 'Chat'){
      io.sockets.emit('mensaje', {
        to: data.room,
        from: socket.nickname,
        msj: data.msj,
        fecha: data.fecha
      });
    }else{
      io.sockets.in(data.room).emit('mensaje', {
        to: data.room,
        from: socket.nickname,
        msj: data.msj,
        fecha: data.fecha
      });
    }

    //create new model
    var mensajes = new Mensaje({
      to: data.room,
      from: socket.nickname,
      msj: data.msj,
      fecha: data.fecha
    });
    //save model to MongoDB
    mensajes.save(function (err) {
      if (err) {
        return err;
      }
      else {
        console.log("mensaje guardado");
      }
    });
  });


  //Cuando sale un usuario de la app
  socket.on('disconnect', function() {
    if(!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);
    socket.broadcast.emit('nicknames', nicknames);
  });

});








// var app = require('express').createServer(),
//     io = require('socket.io').listen(app);

// app.listen(3000);

// app.get('/',function (reg, res){
//   res.sendFile(__dirname + '/index.html');
// });





// var express = require('express');
// var app = express();
// var io = require('socket.io').listen(app);

// app.get('/', function(req, res){
//   res.send('hello world');
// });

// app.listen(3000);





// var app = require('http').createServer(handler)
//   , io = require('socket.io').listen(app)
//   , fs = require('fs')

// app.listen(3000);

// function handler (req, res) {
//   fs.readFile(__dirname + '/index.html',
//   function (err, data) {
//     if (err) {
//       res.writeHead(500);
//       return res.end('Error loading index.html');
//     }

//     res.writeHead(200);
//     res.end(data);
//   });
// }
// var count = 0;
// io.sockets.on('connection', function (socket) {
//	count++;
//	console.log('usuarios conectados: ' + count);
//	socket.emit('news', { number: count });
//	socket.broadcast.emit('news', { number: count });
//	socket.on('disconnect', function (data) {
//    count--;
//    console.log('usuario desconectado: ' + count);
//    socket.broadcast.emit('news', { number: count });
//	});
// });