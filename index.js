const express = require('express');
const app = express();
const favicon = require('serve-favicon');
app.use(express.static('public'));
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.listen(3000, () => console.log('Server running on port 3000'));
