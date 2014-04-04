//Conexion
var port = Number(process.env.PORT || 5000);
var express = require('express');
var app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

server.listen(port);

app.use(express.static(__dirname + '/'));

app.get('/', function(req, res){
  //res.send('hello world');
  res.sendfile(__dirname + '/index.html');
  //res.sendfile('http://chat-alfredo.herokuapp.com/');
});


var nicknames = [];

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

    }

  });

  //Cuando se envia un mensaje
  socket.on('user mensaje', function(data) {

    io.sockets.emit('user mensaje', {
      nick: socket.nickname,
      message: data
    });

  });

  //Cuando salen de la app
  socket.on('disconnect', function() {

    if(!socket.nickname) return;
    nicknames.splice(nicknames.indexOf(socket.nickname), 1);

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