let app = require('./http-app.js');

let port = process.env.PORT || 5000;

app().listen(port, function () {
    console.log('Express server listening on port ' + port);
});
