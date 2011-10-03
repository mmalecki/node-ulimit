var spawn = require('child_process').spawn;

var stringMapping = {
  'core file size': 'coreFileSize',
  'data seg size': 'dataSegSize',
  'scheduling priority': 'schedulingPriority',
  'file size': 'fileSize',
  'pending signals': 'pendingSignals',
  'max locked memory': 'maxLockedMemory',
  'max memory size': 'maxMemorySize',
  'open files': 'openFiles',
  'pipe size': 'pipeSize',
  'POSIX message queues': 'POSIXMessageQueues',
  'real-time priority': 'realTimePriority',
  'stack size': 'stackSize',
  'cpu time': 'cpuTime',
  'max user processes': 'maxUserProcesses',
  'virtual memory': 'virtualMemory',
  'file locks': 'fileLocks'
};

module.exports = function (callback) {
  ulimit = spawn(process.env.SHELL, ['-c', 'ulimit -a']);

  var output = '';
  ulimit.stdout.setEncoding('utf8');
  ulimit.stdout.on('data', function (chunk) {
    output += chunk;
  });

  ulimit.on('exit', function (code) {
    if (code != 0) {
      return callback(new Error('ulimit exit code: ' + code));
    }

    // First split whole output into lines...
    output = output.split('\n');

    var result = {};
    // Then do some simple regex matching on all lines
    var re = /([A-Za-z -]+)(?:\([a-z, -]+\)) ([a-z0-9]+)/
    output.forEach(function (line) {
      var match = re.exec(line);
      if (match) {
        match[1] = match[1].trim();

        // Try to convert value to an integer when possible
        var value = parseInt(match[2], 10);
        isNaN(value) && (value = match[2]);

        // When value is `'unlimited'`, change it to null
        value == 'unlimited' && (value = null);
        result[stringMapping[match[1]] || match[1]] = value;
      }
    });
    callback(null, result);
  });
};

