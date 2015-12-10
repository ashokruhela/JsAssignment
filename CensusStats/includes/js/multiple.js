var fs = require('fs');
var readMultipleFiles = require('read-multiple-files');

var files = ['India2011.csv','IndiaSC2011.csv','IndiaST2011.csv'];
var allAges = "All ages";

literacyData(files, writeToFile);

var randon = 1;

var northEastStates = ['ARUNACHAL PRADESH', 'Assam', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Sikkim', 'Tripura'];
//reading using read multiple files
function literacyData (csvFiles, callback) {
   var jsonData = [];
   readMultipleFiles(csvFiles, 'utf8', function(err, contents) {
      if(err) console.log('Failed to read');
      else {
         if(contents.length > 0) {
            var hasHeader = false;

            //array of stats
            var states = {};


            for (var i = 0; i < contents.length; i++) {
               var fileContent = contents[i];
               var lines = fileContent.split("\r\n");
               console.log('Reading file ' + csvFiles[i]);
               //Take header from first file only as it is same in all files.
               if(!hasHeader) {
                  headers = lines[0].split(",");
                  hasHeader = true;
               }

               var lineCount = lines.length;
               for (var j = 1; j < lineCount; j++) {
                  var currentLine = lines[j].split(",");

                  if(currentLine[4] == "Total" && currentLine[5] == "All ages") {
                     var currentState = currentLine[3];

                     if(currentState in states) {
                        //console.log("Increment state " + currentState);
                        //Increment values if state is already present
                        var state = states[currentState];
                        state.literacyMale += parseInt(currentLine[13]);
                        state.illiteracyMale += parseInt(currentLine[10]);
                        state.literacyFemale += parseInt(currentLine[14]);
                        state.illiteracyFemale += parseInt(currentLine[11]);
                        state.isNorth = isNorthEastState(currentState);
                        //console.log(state + " " + state.isNorth);

                     } else {
                        //console.log("Creating new state " + currentState);
                        //create new state in the array and set is values
                        states[currentState] = {
                           literacyMale : parseInt(currentLine[13]),
                           literacyFemale : parseInt(currentLine[14]),
                           illiteracyMale : parseInt(currentLine[10]),
                           illiteracyFemale :parseInt(currentLine[11])
                        };
                        //console.log(states[currentState]);
                     }

                  }
               }
               //end of file1
               //console.log('end of file ' + i);
            }

            //filter and create json
            var totalJson = filterTotalPopulation(states);
            var stateJson = filterStatePopulation(states, false);
            var northEastStateJson = filterStatePopulation(states, true);
            var jsons = {
               'all': totalJson,
               'state': stateJson,
               'northEast': northEastStateJson
            };
            for(json in jsons) {
               fs.writeFile(json + ".json", jsons[json], function(err){
                  if(err){console.log('Failed to write json file');}
                  else {
                     console.log('Data written successfully');
                  }
               });
            };
         }
      }
   });


}

function filterTotalPopulation(states) {
   //Total population

   var total = [];
   var population = {
      literacyMale : 0,
      literacyFemale : 0,
      illiteracyMale : 0,
      illiteracyFemale : 0
   };

   for(state in states) {

      var currentState = states[state];
      population.literacyMale += parseInt(currentState.literacyMale);
      population.literacyFemale += parseInt(states[state].literacyFemale);
      population.illiteracyMale += parseInt(states[state].illiteracyMale);
      population.illiteracyFemale += parseInt(states[state].illiteracyFemale);
   };

   //console.log(population);

   total.push( {
      'LiterateMale' : population.literacyMale,
      'LiterateFemale' : population.literacyFemale,
      'IlliterateMale' : population.illiteracyMale,
      'IlliterateFemale' : population.illiteracyFemale
   });

   return JSON.stringify(total);
   //console.log(json);
}

function filterStatePopulation(states, isNorthEast) {
   //Total population

   var total = [];

   for(state in states) {

      var currentState = states[state];
      if(isNorthEast && !currentState.isNorth) {continue;}

      //console.log(state);
      total.push( {
         'state': getState(state),
         'LiterateMale' : currentState.literacyMale,
         'LiterateFemale' : currentState.literacyFemale,
         'IlliterateMale' : currentState.literacyMale,
         'IlliterateFemale' : currentState.literacyFemale
      });
   };

   return JSON.stringify(total);
   //console.log(json);
}

function getState(longName) {
   return longName.split("-")[1];
}

function writeToFile(jsonData) {
   for(json in jsonData) {
      fs.writeFile(json + ".json", jsonData, function(err){
         if(err){console.log('Failed to write json file');}
         else {
            console.log('Data written successfully');
         }
      });
   };
}

function isNorthEastState(state) {
   //console.log(state);
   for (nState of northEastStates) {
      // console.log(state);
      // console.log(nState);
      if(nState.trim().toUpperCase() == getState(state).trim().toUpperCase()) return true;
   };
   return false;
}
