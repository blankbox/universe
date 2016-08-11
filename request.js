var request = require('request');
var git = require('simple-git');

var debug  = require('tracer').colorConsole();

// Load environment vars
require('dotenv-safe').load({path: '.env-public', sample: '.env-public-sample'});

// Assumes a single path contains this repo and the other repos as siblings
// @TODO consider automatically categorising repos by name and nesting them in folders
var rootPath = __dirname + '/../';

// Create an options object that references the organsation being used - organisation URL part
// Will fetch all repos within the organsation being referenced
// Set User-Agent as lacking this will throw the API request

var pageNumber = 1; //Start with the first page
var perPage = 2; //Max is 100

var buildOpts = function (pageNumber, perPage) {
  return requestOpts = {
    url: 'https://api.github.com/orgs/' + process.env.ORG + '/repos?per_page=' + perPage + '&page=' + pageNumber,
    headers : {'User-Agent': process.env.UNIVERSE}
  }
}

// Clone or pull a repo
var grabRepo = function (repoName, repoUrl, repoFullName) {

  // Initialise at the root
  git(rootPath)
  // Prevent throwing actual error
  .silent(true)
  // Attempt to clone this repo
  .clone(repoUrl, repoName, function (err, data) {

    // Pull the repo as it's already there
    // Assumes all errors mean repo exists locally
    // @TODO detect exact error capture
    if (err) {

      // Working directory needs to be repo folder
      git(rootPath + repoName)
      // Begin pull requets
      // @TODO consider only pulling from origin/master
      .pull(function (err, data) {

        if (err) {
          debug.error('Pull error on', repoName, err);
        } else {
          debug.info('Pulled', repoFullName);
          debug.log('Changes', data.summary.changes);
          debug.log('Insertions', data.summary.insertions);
          debug.log('Deletions', data.summary.deletions);
        }

      });

    } else {
      // Clone has happened as it wasn't there before
      debug.log('Cloned', repoFullName);
    }

  }).then(function () {});

}

// Create handler for the request response
var requestHandler = function (error, response, body) {

  // If all is well, and the API servers a valid response - continue
  if (!error && response.statusCode == 200) {

    // body is a JSON array of objects containing repository data
    var repos = JSON.parse(body);

    debug.info('Found', repos.length, process.env.UNIVERSE, 'repositories');

    // Loop through each repo
    for (var i = 0; i < repos.length; i++) {
      // Current repo in the loop
      var repo = repos[i];

      // Check if current repo is UNIVERSE
      if (repo.name !== process.env.UNIVERSE) {
        grabRepo(repo.name, repo.ssh_url, repo.full_name);
      }

    }
    //Check for more - if we got as many repos as the request limit, could have missed some, so repeat the request for the next page
    if (repos.length >= perPage){
      pageNumber ++;
      nextRequest = buildOpts(pageNumber, perPage);
      request(nextRequest, requestHandler);
    }

  } else {
    debug.error('Error with request', error);
  }



}

var requestOpts = buildOpts(pageNumber, perPage);

request(requestOpts, requestHandler);
