const express = require('express');
const fsPromises = require('./fsPromises');
const auth = require('./auth');
const articlesApi = require('./articles')

const app = express();

const distDir = __dirname + '/dist';

app.get('/api/auth', (req, res) => {

  if (req.get("auth")) {
    auth.createAuthRequest(req.get("nonce"), (err, serverUuid) => {
      if (err)
        res.send(err.message);
      else
        res.header("nonce", serverUuid).sendStatus(200);
    });
  } else {
    auth.authRequest(req.get("client"), req.get("hash"), (err, success) => {
      if (err) {
        res.status(401).send(err.message);
      } else {
        res.header("nonce", success).sendStatus(200);
      }
    });
  }
});

app.get('/api/admin', (req, res) => {
  auth.authAdminRequest(req.get("client"), req.get("hash"), (err, success) => {
    if (err) {
      res.status(401).send(err.message);
    } else {
      res.header("nonce", success);
      res.send("Friendly reminder: ALENA, PLEASE MAKE ADMIN PANEL ALSO. THANKS");
    }
  });
});

app.get('/api/articles', (req, res) => {
  res.send(articlesApi.getArticles());
});

app.get('/api/article/:id', (req, res) => {
  let id = req.params.id;
  let article = articlesApi.getArticle(id);
  if (article)
    res.send(article);
  else
    res.sendStatus(404);
});

app.use(express.static(distDir));

app.get('/', (req, res) => {
  res.sendStatus(200);
  res.sendFile(distDir + '/index.html');
});

app.get('/article/:id', (req, res) => {
  res.sendStatus(404);
});

module.exports = function() {
  return app;
}