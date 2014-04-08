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
    nick: String,
    message: String,
    fecha: String
});
// Mongoose Model definition
var Mensaje = mongoose.model('mensajes', mensajesdb);



var nicknames = [];
var historial = [];

var today = new Date();
var dd = today.getDate();
var mm = today.getMonth(); //January is 0!
var h = today.getHours();
var min =today.getMinutes();

var yyyy = today.getFullYear();
//if(dd<10){dd='0'+dd;}
//if(mm<10){mm='0'+mm}
var monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
var today = dd+'.'+monthNames[mm]+'.'+yyyy+' '+h+':'+min;



//Socketio
//Cuando entran a la app
io.sockets.on('connection', function (socket) {

  //Cuando entra un usuario
  socket.on('nickname', function(data, callback) {

    if(nicknames.indexOf(data) != -1){
      callback(false);
    }else{
      callback(true);
      nicknames.push(data);
      socket.nickname = data;
      io.sockets.emit('nicknames', nicknames);
      Mensaje.find({}, function (err, docs) {
        historial=docs;
        io.sockets.emit('historial', historial);
      });

    }

  });

  //Cuando se envia un mensaje
  socket.on('user mensaje', function(data) {

    io.sockets.emit('user mensaje', {
      nick: socket.nickname,
      message: data
    });
    //create new model
    var mensajes = new Mensaje({nick: socket.nickname, message: data, fecha: today});
    //save model to MongoDB
    mensajes.save(function (err) {
      if (err) {
        return err;
      }
      else {
        console.log("Post saved");
      }
    });
  });

  //Cuando salen de la app
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