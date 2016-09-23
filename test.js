const axios = require('axios');

axios.get('https://app-api.tattoodo.com/v1/app/images?length=1')
    .then(function (response) {
        console.log(response.data.data[0].url);
    })
    .catch(function (error) {
        console.log(error);
    });