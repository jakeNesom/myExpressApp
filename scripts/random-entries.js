  

  /* This Javascript Object generates mongoDB entries for my 
  LAASVisualizer Project */
  


  var EntryGen = function(number, timeFrame) {
    this.numOfEntries = number;
    this.timeFrame = timeFrame;

  };

  EntryGen.prototype.nodeGen = function () {
      return "node " + (1 + Math.floor(Math.random() * 6));
  }

  EntryGen.prototype.logTypeGen = function () {
      var logType = ["Information", "Error", "Exception", "Trace", "Debug" ];
      randomNum = Math.floor(Math.random() * 5);
      return logType[randomNum];
  };

  EntryGen.prototype.clientGen = function () {
      return "client " + (1 + Math.floor(Math.random() * 10));
  };

  EntryGen.prototype.createClient = function () {
       var entry = {
         'Client': this.clientGen(),
         'Node': this.nodeGen(),
         'Message': 'testMessage',
         'LogType': this.logTypeGen(),
         'Time': this.timeGen(this.timeFrame)
       };
       
       return entry;       
  };

  EntryGen.prototype.timeGen = function (timeSpan) {
      var startTime = new Date().getTime() - timeSpan;
      return parseInt(startTime + Math.floor((Math.random() * timeSpan) + 60000));
  };
  
    module.exports = EntryGen;

