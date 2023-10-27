const http = require('http');
const requestListener = require('./requestListener');

//menjalankan index
const index =http.createServer(requestListener);

const port = 5000;
const host = "localhost";

index.listen(port, host, () => {
    console.log(`Server is now running at http://${host}:${port}`);
})