
const express = require('express'),
    mongoose = require( 'mongoose'),
    Response = require('./../models/response');

exports.save = function (data) {
  var stage = 'Saving trial data in db...';
  return new Promise((resolve, reject) => {
    console.log(data.participant_id, stage);
    Response.create(data, (err, result) => {
      if (err){
        err.participant_id = data.participant_id;
        reject(err);
      } else {
        console.log(data.participant_id, 'Data saved!');
        resolve(data);
      }
    });
  });
};
