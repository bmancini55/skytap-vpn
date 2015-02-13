var fs        = require('fs')
  , minimist  = require('minimist')
  , Skytap    = require('node-skytap')
  , skytap    = null
  , argv      = minimist(process.argv.slice(2))

  , username  = argv.username || argv.u
  , token     = argv.token    || argv.t
  , vpn_id    = argv.vpn      || argv.v
  , inFile    = argv.in       || argv.i
  ;


// script usage
if(!username || !token || !vpn_id || !inFile) {
  console.log('Usage: node attach --username="SOME_USER" --token="TOKEN" --vpn="VPN_ID" --in="INPUT_FILE');
  console.log('       node attach -u "SOME_USER" -t "TOKEN" -v "VPN_ID" -i "INPUT_FILE"');
  console.log('');
  console.log('       File format: { "network_id": "VALUE", "configuration_id": "VALUE", "name": "VALUE" }');
  process.exit();
}

// initialize the skytap client
skytap = Skytap.init({
  username: username,
  token: token
});

// retrieve all environments
fs.readFile(inFile, function(err, data) {
  console.log('read file %s', inFile);

  var attachments = JSON.parse(data);
  console.log('attaching %s environments', attachments.length);

  // detach each
  function run() {    
    var attachment = attachments.splice(0,1)[0];
    if(attachment) {
      processAttachment(attachment, run);
    }
  }
  run();
});

// process each attachment
function processAttachment(attachment, next) {
  var maxErrors   = 20
    , errorCount  = 0
    , params
    ;

  params = { 
    configuration_id: attachment.configuration_id,
    network_id: attachment.network_id,
    vpn_id: vpn_id
  };

  function runAttach() {
    console.log('attaching  env %s - %s', attachment.configuration_id, attachment.name);
    skytap.vpns.attach(params, function(err) {

      // abort since we've reached max error count
      if(err && errorCount >= maxErrors -1) {
        next();
      } 

      // error and retry
      else if(err) { 
        console.log('- failed with error %s', err.error || err);
        errorCount += 1;
        runAttach();
      } 

      // we had success, lets move on
      else {
        errorCount = 0;
        runConnect();
      }
    });

  }

  function runConnect() {
    console.log('connecting env %s - %s', attachment.configuration_id, attachment.name);
    skytap.vpns.connect(params, function(err) {

      // abort since we've reached max error count
      if(err && errorCount >= maxErrors - 1) {
        next();
      }

      // error and retry
      else if(err) {
        console.log('- failed with error %s', err.error || err);  
        errorCount += 1;
        runConnect();
      }

      // we had success, lets move on
      else {
        next();
      }
    });
  }

  // start things
  runAttach();
}