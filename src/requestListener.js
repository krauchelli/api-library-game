let array = require('./data');
const { nanoid } = require('nanoid');
const fs = require('fs');

const requestListener =(request, response) => {
    response.setHeader('Content-type', 'application/json');

    //penambahan method dan url pada request
    const url = request.url.split('/')[1];
    const params = request.url.split('/')[2];
    const method = request['method'];

    //routing
    if (method === 'GET') {
        switch (url){
            case '':
                response.statusCode = 200;
                response.end(JSON.stringify({
                    message: "Ini adalah homepage!"
                }));
                break;
            case 'libraries':
                const responseJson = {
                    message: 'mendapatkan semua data library',
                    library: array
                };
                response.statusCode = 200;
                response.end(JSON.stringify(responseJson));
                break;
            case 'library':
                const cekLibrary = array.filter((item) => item.gameId === params);
                if (cekLibrary !== undefined) {
                    response.statusCode = 200;
                    response.end(JSON.stringify({
                        status: "Success",
                        library: {
                            cekLibrary,
                        }
                    }));
                }
                break;
        }
    }

    else if (method === 'POST') {
        switch (url) {
            case 'library':
                let requestBody = '';
                request.on('data', (chunk) => {
                    requestBody += chunk;
                });

                request.on('end', () => {
                    const { gameName, genre } = JSON.parse(requestBody);
                    const gameId = `id-${nanoid(10)}`;

                    const newLibrary = {
                        gameId, gameName, genre,
                    };
                    //pengecekan jika duplikasi
                    const checkDuplicate = array.some((item) => item.gameName === newLibrary.gameName);
                    console.log(`Ada duplikasi? ${checkDuplicate}`);
                    if (checkDuplicate) {
                        response.statusCode = 400;
                        return response.end(JSON.stringify({
                            status: "failed",
                            message: "duplicate library is not allowed, please try again"
                        }));
                    }

                    array.push(newLibrary);
                    const isSuccess = array.filter((array) => array.gameId === gameId).length > 0;
                    if (isSuccess) {
                        response.statusCode = 201;
                        response.end(JSON.stringify({
                            message: "Library berhasil ditambahkan!",
                            data: {
                                "gameId": gameId
                            }
                        }));
                    }
                });
                break;
        }
    }

    else if (method === 'PUT') {
        switch (url) {
            case 'library':
                let requestBody = '';
                request.on('data', (chunk) => {
                    requestBody += chunk;
                }); //konsep ini merupakan bentuk native dari request.payload
                request.on('end', () => {
                    const { gameName, genre } = JSON.parse(requestBody);
                    const index = array.findIndex((item) => item.gameId === params);
                    //jika sukses
                    if (index !== -1) {
                        array[index] = {
                            ...array[index],
                            gameName,
                            genre
                        }
                        response.statusCode = 200;
                        return response.end(JSON.stringify({
                            status: 'Success',
                            message: 'Library berhasil diperbarui!'
                        }));
                    }
                    //jika tidak
                    response.statusCode = 400;
                    return response.end(JSON.stringify({
                        status: 'Failed',
                        message: "Library gagal diperbarui!"
                    }));

                });
                break;
        }
    }

    else if (method === 'DELETE') {
        switch (url) {
            case 'library':
                const index = array.findIndex((item) => item.gameId === params);

                if (index !== -1) {
                    array.splice(index, 1);
                    response.statusCode = 200;
                    return response.end(JSON.stringify({
                        status: "success",
                        message: "library berhasil dihapus"
                    }));
                }

                response.statusCode = 400;
                return response.end(JSON.stringify({
                    status: "failed",
                    message: "library gagal dihapus"
                }));
        }
    }

};

module.exports = requestListener;