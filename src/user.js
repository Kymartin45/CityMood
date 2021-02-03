const { request } = require('express');
const express = require('express');
const querystring = require('querystring');
const accessToken = require('../app');

const app = express();

// const token = '';
const stateKey = 'spotify_auth_state';

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

app.get('/playlists', function(req, res) {
    const state = generateRandomString(16);
    const scope = 'playlist-read-private';
    res.cookie(stateKey, state);
    res.redirect('https://api.spotify.com/v1/me/playlists?' +
    querystring.stringify({
        access_token: accessToken,
        token_type: 'Bearer',
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        redirect_uri: redirect_uri,
        state: state
    }));
});
