const express = require('express');

exports.start = (req, res) => {
    console.log('start triggered')
    //if game exists code 400
    //if not, create game via interacting with models and send code 200
};