const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));
app.use('/js',express.static(path.join(__dirname, 'public/js')));
app.use('/img',express.static(path.join(__dirname, 'public/images')));
app.listen(3000, () => console.log('Server running on port 3000'));
