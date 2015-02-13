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

// retrieve all attachments
fs.readFile(inFile, function(err, data) {
  console.log('read file %s', inFile);

  var attachments = JSON.parse(data);
  console.log('detaching %s environments', attachments.length);

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

  function runDetach() {
    console.log('detaching env %s - %s', attachment.configuration_id, attachment.name);
    skytap.vpns.detach(params, function(err) {

      // when no err, 
      // or the error is one related to detachments
      // or we have reached our limit
      // move on...
      if( !err || 
        err.toString() === 'ReferenceError: write is not defined' || 
        err.error === 'Environment not attached to VPN' ||
        errorCount >= maxErrors - 1) {
        next();
      } 

      // retry
      else {
        console.log('- failed with error %s', err.error || err);
        errorCount += 1;
        runDetach();
      }
    });
  }

  // start things
  runDetach();

}