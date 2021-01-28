const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const cors = require('cors');
const request = require('request');
const { json, query } = require('express');
const querystring = require('querystring');
const { stat } = require('fs');
const { post } = require('request');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
//Temp to test OAuth flow before Heorku deployment
const port = 8888;

const client_id = process.env.CLIENT_ID; 
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

// const accessToken = {access_token: ''};

app.use(express.static(__dirname + '/public'));

app.get('/login', function(req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' + 
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email',
        redirect_uri: redirect_uri
    }));
});

app.get('/callback', function(req, res) {
    const code = req.query.code || null 
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization' : 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        json: true
    }
    request.post(authOptions, function(error, response, body) {
        const access_token = body.access_token
        const uri = 'http://localhost:8888/';
        res.redirect(`${uri}?access_token=${access_token}`);
        //User access token info
        console.log(body);
    });
});

//Will implement Heroku server hosting
console.log(`Listening on ${port}. Go to /login for OAuth flow`);
app.listen(port);