'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const app = express();
const token = process.env.FB_PAGE_ACCESS_TOKEN;

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// Facebook Endpoint
app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            let regexDiscover = /discover/ig;
            let regexArticle = /article/ig;

            if (regexDiscover.test(text)) {
                let newText = text.split(" ");

                newText = newText[1];

                sendDiscover(newText, sender);
            }

            if(regexArticle.test(text)) {
                let newText = text.split(" ");

                newText = newText[1];

                sendArticle(newText, sender);
            }

            if (text === 'Hello') {
                sendWelcomeMessage(sender, text);
                continue
            }

            if (text === 'Tattoo') {
                sendTattoo(sender, text);
                continue
            }

            if (text === 'Get Started') {
                console.log('Get Started');
                continue
            }

            sendTextMessage(sender, 'I recieved a command, I don\'t know what it means: ' + text.substring(0, 200))
        }
        if (event.postback) {
            let payload = event.postback.paylod;

            console.log(payload);

            if (payload === 'NEXT_PAGE') {

            }
        }
    }
    res.sendStatus(200)
});

// FUNCTIONS
function sendTextMessage(sender, text) {
    let messageData = { text:text };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTattoo(sender, text) {
    // First we need to get an image!
    let image;
    let imageId;
    axios.get('https://app-api.tattoodo.com/v1/app/images?length=1')
        .then(function (response) {
            console.log(response.data.data[0].url);
            image = response.data.data[0].url;
            imageId = response.data.data[0].id;

            let messageData = {
                'attachment': {
                    'type': 'template',
                    'payload': {
                        'template_type': 'generic',
                        'elements': [{
                            'title': 'First card',
                            'subtitle': 'Element #1 of an hscroll',
                            'image_url': image,
                            'buttons': [{
                                'type': 'web_url',
                                'url': 'https://www.tattoodo.com/p/' + imageId + '/',
                                'title': 'Discover it!'
                            }, {
                                'type': 'postback',
                                'title': 'Show me more!',
                                'payload': 'Payload for first element in a generic bubble'
                            }]
                        }   ]
                    }
                }
            };
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:token},
                method: 'POST',
                json: {
                    recipient: {id:sender},
                    message: messageData,
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending messages: ', error)
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error)
                }
            })
        })
        .catch(function (error) {
            console.log(error);
        });

}

function sendDiscover(text, sender) {
    axios.get('https://app-api.tattoodo.com/v1/app/images?length=3&hashtag=' + text)
        .then(function (response) {
            console.log(response.data);

            let messageData = {
                'attachment': {
                    'type': 'template',
                    'payload': {
                        'template_type': 'generic',
                        'elements': [
                            {
                                'title': 'First Discover Card',
                                'subtitle': response.data.data[0].description,
                                'image_url': response.data.data[0].url,
                                'buttons': [{
                                    'type': 'web_url',
                                    'url': 'https://www.tattoodo.com/p/' + response.data.data[0].id + '/',
                                    'title': 'Discover it!'
                                }, {
                                    'type': 'postback',
                                    'title': 'Show me more!',
                                    'payload': 'NEXT_PAGE'
                                }]
                            },
                            {
                                'title': 'Second Discover Card',
                                'subtitle': response.data.data[1].description,
                                'image_url': response.data.data[1].url,
                                'buttons': [{
                                    'type': 'web_url',
                                    'url': 'https://www.tattoodo.com/p/' + response.data.data[1].id + '/',
                                    'title': 'Discover it!'
                                }, {
                                    'type': 'postback',
                                    'title': 'Show me more!',
                                    'payload': 'NEXT_PAGE'
                                }]
                            },
                            {
                                'title': 'Third Discover Card',
                                'subtitle': response.data.data[2].description,
                                'image_url': response.data.data[2].url,
                                'buttons': [{
                                    'type': 'web_url',
                                    'url': 'https://www.tattoodo.com/p/' + response.data.data[2].id + '/',
                                    'title': 'Discover it!'
                                }, {
                                    'type': 'postback',
                                    'title': 'Show me more!',
                                    'payload': 'NEXT_PAGE'
                                }]
                            }
                        ]
                    }
                }
            };
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:token},
                method: 'POST',
                json: {
                    recipient: {id:sender},
                    message: messageData
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending messages: ', error)
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error)
                }
            })
        })
        .catch(function (error) {
            console.log(error);
        });
}

function sendArticle(text, sender) {
    axios.get('https://content-api.tattoodo.com/v1/content?includes=meta&length=3&search=' + text)
        .then(function (response) {

            let messageData = {
                'attachment': {
                    'type': 'template',
                    'payload': {
                        'template_type': 'generic',
                        'elements': [
                            {
                                'title': 'First Discover Card',
                                'subtitle': "hihihi",
                                'image_url': 'https://www.tattoodo.com/images/0/' + response.data.data[0].meta.data.og_image_id + '.jpg',
                                'buttons': [{
                                    'type': 'web_url',
                                    'url': 'https://tattoodo.com' + response.data.data[0].url,
                                    'title': 'Discover it!'
                                }]
                            },
                            {
                                'title': 'Second Discover Card',
                                'subtitle': 'Element #1 of an hscroll',
                                'image_url': 'https://www.tattoodo.com/images/0/' + response.data.data[1].meta.data.og_image_id + '.jpg',
                                'buttons': [{
                                    'type': 'web_url',
                                    'url': 'https://tattoodo.com' + response.data.data[1].url,
                                    'title': 'Discover it!'
                                }]
                            },
                            {
                                'title': 'Third Discover Card',
                                'subtitle': 'Element #1 of an hscroll',
                                'image_url': 'https://www.tattoodo.com/images/0/' + response.data.data[2].meta.data.og_image_id + '.jpg',
                                'buttons': [{
                                    'type': 'web_url',
                                    'url': 'https://tattoodo.com' + response.data.data[2].url,
                                    'title': 'Discover it!'
                                }]
                            }
                        ]
                    }
                }
            };
            request({
                url: 'https://graph.facebook.com/v2.6/me/messages',
                qs: {access_token:token},
                method: 'POST',
                json: {
                    recipient: {id:sender},
                    message: messageData,
                }
            }, function(error, response, body) {
                if (error) {
                    console.log('Error sending messages: ', error)
                } else if (response.body.error) {
                    console.log('Error: ', response.body.error)
                }
            })
        })
        .catch(function (error) {
            console.log(error);
        });
}

function sendWelcomeMessage(sender) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: {
                text: 'Hello my friend!'
            }
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
});
