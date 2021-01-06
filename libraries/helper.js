/*
Custom functions for saving data in a jsPsych study
*/

function prepareData(experiment_start_time){
  // Get the jsPsych data, convert to JSON format, and add the participant info.
  console.log('    Preparing data...');
  var data = {};
  var experiment_end_time = Date.now();
  var duration = experiment_end_time - experiment_start_time;
  var interactionData = jsPsych.data.getInteractionData().json();
  jsPsych.data.get().addToLast({duration: duration,
                                interactionData: interactionData,
                              });
  data.responses = jsPsych.data.get().json();
  data.participant_id = participant_id;
  return data;
}

// Allow multiple attempts at saving if there's an error
var max_attempts = 5;
var save_attempts = 0;
var save_timeout = 3000;

function save(data, dataUrl){
  // The app needs to be provisioned with a database for this to work.
  // Once it has, the URI for the database can be passed as argument dataUrl
  console.log('    About to post survey output data...', data);
  dataJSON = JSON.stringify(data);
  $.ajax({
     type: 'POST',
     url: dataUrl,
     data: dataJSON,
     contentType: "application/json",
     timeout: save_timeout,
     success: function(request, status, error){
       finish(participant_id+'_'+save_attempts);
     },
     error: function(request, status){
       $('#jspsych-content').html("Please wait a few seconds while we save your responses...");
       console.log('    Error posting data...', request, status);
       if(save_attempts < max_attempts){
         // if error, have another attempt (and do so after a longer timeout)
         save_attempts += 1;
         save_timeout += 500;
         console.log("Trying again, attempt ", save_attempts);
         setTimeout(function () {
            save(data, dataUrl);
          }, save_timeout);
       } else {
         finish(participant_id+'_'+save_attempts);
       }
     }
   });
}

function finish(completionCode){
   // Once the data is saved (or too many attempts failed) redirect to debrief page
    console.log('    Rerouting to finish page...');
    window.location.href = "/finish?token="+completionCode;
}

function makeCode(len){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYabcdefghijklmnopqrstuvwxy0123456789";
  for( var i=0; i < len; i++ ){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

var helper = {
  makeCode: makeCode,
  prepareData: prepareData,
  save: save,
};

// Handles exports differently, depending whether this script is loaded by node
// or by client
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = helper;
  }
  exports.helper = helper;
} else {
  window.helper = helper;
}
