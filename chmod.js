const fs = require('fs');

fs.chmod("dist/cli.js", fs.constants.X_OK, () => {});

// chmod +x