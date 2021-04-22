const fs = require('fs');

fs.chmodSync("dist/cli.js", 0o600);