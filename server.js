var express = require('express'),
  fs = require('fs');

var app = express();

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/imgs', express.static(__dirname + '/imgs'));

app.get('*', function(req, res, next) {

  next();

});

app.on('render:index', function(encoding, req, res) {
  var template = 'index.html';
  fs.readFile(template, encoding, function(err, html) {
    res.contentType('text/html');
    res.send(200, html);
  });
});


app.get('/', function(req, res, next) {

  app.emit('render:index', 'UTF-8', req, res);

});

app.listen(8765);

