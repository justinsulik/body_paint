/*jshint esversion: 6 */

/*
LOAD MODULES
*/
const express = require('express'),
  url = require('url'),
  body_parser = require('body-parser'),
  ejs = require('ejs'),
  detect = require('browser-detect'),
  db = require(__dirname+'/controllers/db'),
  tasks = require(__dirname+'/controllers/tasks'),
  responses = require(__dirname+'/controllers/responses'),
  helper = require(__dirname+'/libraries/helper.js');

/*
INSTANTIATE THE APP
- Use a custom study_name variable to help track whether you're testing, piloting, running 'study1' etc.
- process.env.PORT will retrieve the relevant port # from Heroku if deployed,
  otherwise use port 5000 locally, which you can visit by entering 'localhost:5000' in a browser IF the app is running
*/
const study_name = 'test';
const app = express();
const PORT = process.env.PORT || 5000;

/*
DATABASE SETUP
- Uncomment the db.connect line below once you've added a database
- process.env.MONGODB_URI will retrieve the relevant connection info from Heroku when deployed,
  otherwise it will look in a local hidden file .env for a key called MONGODB_URI
*/
// db.connect(process.env.MONGODB_URI);


/*
SET MIDDLEWARE/LIBRARIES/PARSING
- Basically, just tells the app how to handle certain info,
  Where to look for certain files,
  Or what file types to expect
*/
app.use(express.static(__dirname + '/public'));
app.use(body_parser.json({ limit: '50mb' }));
app.use(body_parser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 500000 }));
app.use('/jspsych', express.static(__dirname + "/jspsych"));
app.use('/libraries', express.static(__dirname + "/libraries"));
app.use('/helper', express.static(__dirname + "/helper"));
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/views');


/*
ROUTING
- Tells the app what to do if requests are made (e.g. someone tries to visit the app URL),
  or if the experiment script makes a request to save data
*/

app.get('/', (req, res, next) => {
    // Generate anonymous code to identify this trial
    const participant_id = helper.makeCode(2)+'5'+helper.makeCode(5)+'RtR'+helper.makeCode(4)+'m'+helper.makeCode(2);
    // What browser is the participant using?
    const browser = detect(req.headers['user-agent']);

    // save above trial-specific info
    tasks.save({
        "participant_id": participant_id,
        "study_name": study_name,
        "browser": browser,
    });

    res.render('experiment.ejs', {input_data: JSON.stringify({participant_id: participant_id})});
});

/*
SAVE TRIAL DATA
- This will obviously only work once you've provisioned the database and uncommented the db.connect() function above
- Include printouts here to check that it's arriving properly
*/

app.post('/data', (req, res, next) => {
  const data = req.body;
  const participant_id = req.query.participant_id || 'none';
  console.log(participant_id, 'Preparing to save trial data...');
  responses.save({
    participant_id: participant_id,
    study_name: study_name,
    trial_data: data,
  })
  .then(res.status(200).end());
});

/*
Render the final screen, with completionCode and debrief
*/
app.get('/finish', (req, res) => {
  let code = req.query.token;
  if(code.length==0){
    // If, for whatever reason, the code has gone missing, generate a new one so that the participant can get paid
    code = helper.makeCode(10) + 'SZs';
  }
  res.render('finish.ejs', {completionCode: code});
});

/*
START THE SERVER
*/
var server = app.listen(PORT, function(){
    console.log("Listening on port %d", server.address().port);
});
