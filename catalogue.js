var fs        = require('fs')
  , minimist  = require('minimist')
  , Skytap    = require('node-skytap')
  , skytap    = null
  , results   = []
  , argv      = minimist(process.argv.slice(2))

  , username  = argv.username || argv.u
  , token     = argv.token    || argv.t
  , vpn_id     = argv.vpn      || argv.v
  , out       = argv.out      || argv.o
  ;

// script usage
if(!username || !token || !vpn_id || !out) {
  console.log('Usage: node catalogue --username="SOME_USER" --token="TOKEN" --vpn="VPN_ID" --out="OUTPUT_PATH');
  console.log('       node catalogue -u "SOME_USER" -t "TOKEN" -v "VPN_ID" -o "OUTPUT_PATH"');
  process.exit();
}

// initialize the skytap client
skytap = Skytap.init({
  username: username,
  token: token
});

// retrieve all environments
skytap.environments.all(function(err, envs) {
  console.log('found %s environments', envs.length);

  // parse each environment
  function run() {    
    var env = envs.splice(0,1)[0];
    if(env) {
      processEnv(env, run);
    } else {
      write();
    }
  }

  run();

});

// processess an environment
function processEnv(env, next) {
  console.log('processing env %s - %s', env.id, env.name);

  // get the environment
  skytap.environments.get({ configuration_id: env.id }, function(err, env) {

    // iterate over each network
    if(env && env.networks) {
      env.networks.forEach(function(network) {        

        // iterate over each vpn attachment
        if(network.vpn_attachments) {
          network.vpn_attachments.forEach(function(attachment) {            

            // ensure this is the vpn we want to catalogue
            if(attachment.vpn.id === vpn_id) {              
              var result = { 
                'network_id': attachment.network.id,
                'configuration_id': attachment.network.configuration_id,
                'name': env.name
              };
              results.push(result);
            }

          });
        }
      });
    }
    next();
  });
}

// writes the results as JSON data
function write() {
  var text = JSON.stringify(results, null, 2);
  fs.writeFileSync(out, text);
}