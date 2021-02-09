const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const stateKey = 'spotify_auth_state';
const app = express();

var SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

app.use(express.static(__dirname = './public'))
    .use(cors())
    .use(cookieParser());

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
];

// const client_id = process.env.CLIENT_ID; 
// const client_secret = process.env.CLIENT_SECRET;
// const redirect_uri = process.env.REDIRECT_URI;

const api = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
});

app.get('/', function(err, res) {
    if (!error) {
        res.sendFile('./index.html', { root: __dirname });
    } else {
        console.log(err);
    }
});

app.get('/login', function(req, res) {
    api.clientCredentialsGrant().then(function(data) {
        res.redirect(api.createAuthorizeURL(scopes));
        console.log('Access token expires in ' + data.body['expires_in'] + 's');
        console.log('Access token: ' + data.body['access_token']);

        //Save access token for future calls 
        api.setAccessToken(data.body['access_token']);

    }, function(err) {
        console.log('Error retrieving access token', err)
    });
});

app.get('/callback', function(req, res) {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state; 

    if(error) {
        console.error('Callback error:', error);
        res.send(`Callback error: ${error}`);
        return;
    }

    api.authorizationCodeGrant(code).then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];

        api.setAccessToken(access_token);
        api.setRefreshToken(refresh_token);

        res.sendFile('index.html', { root: __dirname });

        setInterval(async () => {
            const data = await api.refreshAccessToken();
            const access_token = data.body['access_token'];

            console.log('Access token refreshed');
            console.log('Access token: ', access_token);
            api.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
    })
    .catch(error => {
        console.error('Error getting token:', error);
        res.send(`Error getting token: ${error}`);
    });
});

//Will implement Heroku server hosting
const port = 8888;
app.listen(port);
console.log(`Listening to port ${port}`)