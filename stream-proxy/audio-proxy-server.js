/**
 * Taken from:
 * https://gist.github.com/sixertoy/6b5433220a45aa754354287ff54a1e2a
 * 
 * INSTALL:
 * ----
 * > yarn add express request
 * 
 * RUN:
 * ----
 * > node ./audio-proxy-server
 */
const os = require('os');
const dns = require('dns');
const cors = require('cors');
const express = require('express');
const request = require('request');

const app = express();
const hostname = os.hostname();

// defined in .env file
const serverport = (process.env.PORT || process.env.PROXY_PORT || 3000);

// Any streaming radio URI
const radiouri = 'http://i50.letio.com/9170.aac';

app.use(cors())

app.get('/', (req, res) => {
  process.stdout.write('Connected to server\n');
  request.get(radiouri)
    .on('error', () => {})
    .on('response', () => {})
    .pipe(res);

});

app.listen(serverport, () => {
  dns.lookup(hostname, (err, ip) => {
    // retrieve network local ip
    process.stdout.write('Audio Proxy Server runs under\n');
    process.stdout.write(`  Local:        http://locahost:${serverport}\n`);
    process.stdout.write(`  Home Network: http://${ip}:${serverport}\n`);
  });
});