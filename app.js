const express = require('express');
const request = require('request');
const { json, query } = require('express');
const querystring = require('querystring');
const { stat } = require('fs');
const { post, get } = require('request');;
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();

const app = express();

const client_id = process.env.CLIENT_ID; 
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

const stateKey = 'spotify_auth_state';
const accessToken = '';
const refreshToken = '';

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.use(express.static(__dirname + '/public'));
const publicPath = path.join(__dirname, 'public');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/login', function(req, res) {
    res.redirect('https://accounts.spotify.com/authorize?' + 
    querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: 'user-read-private user-read-email',
        redirect_uri: redirect_uri,
        state: 'state'
    }));
});

app.get('/callback', function(req, res) {
    const code = req.query.code ||null 
    const state = req.query.state || null
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code',
            state: state
        },
        headers: {
            'Authorization' : `Basic ${new Buffer(`${client_id}:${client_secret}`).toString('base64')}`,
            'Content-type': 'application/x-www-form-urlencoded'
        },
        json: true
    }
    request.post(authOptions, function(error, response, body) {
        const accessToken = body.access_token;
        const refreshToken = body.expires_in;
        const uri = 'http://localhost:8888';
        // res.redirect(`${uri}?access_token=${token}`);
        //User access token info
        //Changes upon login
        console.log(`Logged in. Access token expires in ${refreshToken} seconds (1 hour)`);

        //Stores access token in tokenObj for later use
        var access_token = {}
        access_token['access_token'] = accessToken;
        console.log(access_token)

        // Passes access token and refresh token to browser to make requests
        res.redirect('/#' + querystring.stringify({
            access_token: accessToken,
            refresh_token: refreshToken
        }));
    });
});

module.exports.accessToken = { accessToken } ;

//Get user playlists
app.get('/playlists', function(req, res) {
    const state = generateRandomString(16);
    const scope = 'playlist-read-private';
    res.cookie(stateKey, state);
    res.redirect('https://api.spotify.com/v1/me/playlists?' +
    querystring.stringify({
        access_token: accessToken,
        token_type: 'Bearer',
        // response_type: 'code',
        // client_id: client_id,
        // scope: scope,
        // redirect_uri: redirect_uri,
        // state: state
    }));
});

//Will implement Heroku server hosting
const port = 8888;
app.listen(port, () => console.log(`Listening on ${port}.`))