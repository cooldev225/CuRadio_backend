const express = require('express');
const multiparty = require('multiparty');

const router = express.Router();
const { FormatAnswer, LogError, GetToken } = require('./utils');
const config = require('./config');
const models = require('./db');
const auth_model = require('./modules/auth');
// const rms_module = require("./modules/rms")
const { IncomingForm } = require('formidable');
const { fileStore, fileDelete } = require('./file');

const fs = require("fs");
const axios = require('axios');
const FormData = require('form-data');
const Models = require("./models")
// const Track = require("./models/Track");

/**
 * Begin of Auth module APIs
 */
router.post('/login', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Headers", "content-type");
    // res.setHeader("Access-Control-Allow-Methods","PUT, POST, GET, DELETE, PATCH, OPTIONS");
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        if (
            params.submit === undefined ||
            params.user === undefined ||
            params.password === undefined
        )
            return res.json(FormatAnswer({ message: 'wrong params' }, config.ERROR_OBJ));
        let result = await auth_model.login(params);
        return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
    });
});

router.post('/register', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        if (
            params.user === undefined ||
            params.email === undefined ||
            params.password === undefined
        )
            return res.json(FormatAnswer({ message: 'wrong params' }, config.ERROR_OBJ));
        let result = await auth_model.register(params);
        return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
    });
});

router.post('/getUserInfo', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getUserInfo(token);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/setUserInfo', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        let result = await auth_model.setUserInfo(token, params);
        return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
    });
});

router.post('/getGenres', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getGenres();
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getMoods', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getMoods();
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getFilterStations', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getFilterStations(token, req.body);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getSearchTrackList', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getSearchTrackList(token, req.body);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getSearchAlbumList', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getSearchAlbumList(token, req.body);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getSearchArtistList', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getSearchArtistList(token, req.body);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getSearchStationList', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getSearchStationList(token, req.body);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/getAnalyzeData', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    let token = GetToken(req);
    if (token == "") {
        return res.json(FormatAnswer({ message: "authentication failure!" }, config.SUCCESS_OBJ));
    }
    let result = await auth_model.getAnalyzeData(token, req.body.file);
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});

router.post('/uploadTrackToAnalyze', async (req, res) => {
    const form = new IncomingForm();
    form.parse(req, async function (err, fields, files) {
        try {
            var { musicFile } = files;
            const path = await fileStore(musicFile, "/upload/audios");
            try {
                var data = new FormData();
                data.append('musicFile', fs.createReadStream(`public${path}`));
                var config = {
                    method: 'post',
                    url: 'https://dashboard.cugate.com/upload_track/',
                    headers: {
                        ...data.getHeaders()
                    },
                    data: data
                };
                axios(config)
                    .then(function (response) {
                        console.log(response.data);
                        return res.status(200).json({ message: "ok", code: 20000, data: response.data })
                    })
                    .catch(function (error) {
                        // res.json({message: "error", code: -20000, error: error});
                    });
            } catch (e) {
                // res.json({message: "error", code: -20000, error: e});
            }
        } catch (error) {
            //   res.json({message: "error", code: -20000, error: error});
        }
    });
    // res.json({message: "error", code: -20000});
});

router.post('/getAnalyzeTrackInfo', async (req, res) => {
    const form = new IncomingForm();
    form.parse(req, async function (err, fields, files) {
        try {
            var { filename } = fields;
            try {
                var data = { "filename": filename };
                var config = {
                    method: 'post',
                    url: 'https://dashboard.cugate.com/get_track_info/',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    data: data
                };
                axios(config)
                    .then(function (response) {
                        return res.status(200).json({ message: "ok", code: 20000, data: response.data })
                    })
                    .catch(function (error) {
                        // res.json({message: "error", code: -20000, error: error});
                    });
            } catch (e) {
                // res.json({message: "error", code: -20000, error: e});
            }
        } catch (error) {
            //   res.json({message: "error", code: -20000, error: error});
        }
    });
    // res.json({message: "error", code: -20000});
});

router.post('/getAnalyzeTrackInfoJson', async (req, res) => {
    const form = new IncomingForm();
    form.parse(req, async function (err, fields, files) {
        try {
            var { filename } = fields;
            try {
                var data = { "filename": filename };
                var config = {
                    method: 'post',
                    url: 'https://dashboard.cugate.com/get_track_info_json/',
                    headers: {
                        'Content-Type': 'text/plain'
                    },
                    data: data
                };
                axios(config)
                    .then(function (response) {
                        return res.status(200).json({ message: "ok", code: 20000, data: response.data })
                    })
                    .catch(function (error) {
                        // res.json({message: "error", code: -20000, error: error});
                    });
            } catch (e) {
                // res.json({message: "error", code: -20000, error: e});
            }
        } catch (error) {
            //   res.json({message: "error", code: -20000, error: error});
        }
    });
    // res.json({message: "error", code: -20000});
});

router.post('/__gg_user', async (req, res) => {
    let result = await auth_model.__gg_user();
    return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
});
/**
 * End of Auth module APIs
 */

router.post('/getRMS', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        if (params === null || params === undefined || params.a === undefined || params.f === undefined || params.cugate_track_id === undefined || params.time_period === undefined)
            return res.json(FormatAnswer({ message: 'wrong params' }, config.ERROR_OBJ));
        let result = await models.getRMS(params);
        return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
    });
});

router.post('/getTrackInfo', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        if (params === null || params === undefined || params.id === undefined || params.id <= 0)
            return res.json(FormatAnswer({ message: 'wrong params' }, config.ERROR_OBJ));
        let result = await models.getTrackInfo(params.id);
        return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
    });
});

router.post('/getSearchTrackTitleList', async (req, res) => {
    let result = []
    // if (is_user_client_in_allowed_product_owners) {
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        let track = await Models.Track.findTracksByTitle(req.body.keyword, req);
        res.json( track );
    });
    // }
});

router.get('/log', async (req, res) => {
    LogError(req.body.type, req.body.error);
    return res.json(FormatAnswer(config.SUCCESS_OBJ));
});

router.get("/getSubGenre", async (req, res) => {
    return res.json([
        { "id": "281", "title": "African" },
        { "id": "282", "title": "Americana" },
        { "id": "283", "title": "Argentinian Tango" }
    ]);
})

router.get("/getPerformerListByKeyword", async (req, res) => {
    return res.json([
        { id: '8835', value: 'A', label: 'A / Russian EAN' },
        { id: '73065', value: 'A', label: 'A / Shenzhen (Tony)' },
        {
            id: '1848407',
            value: 'ARHUS KAMMERORKESTER',
            label: 'ARHUS KAMMERORKESTER / Shenzhen (Tony)'
        },
        {
            id: '1848409',
            value: 'ARHUS KAMMERORKESTER',
            label: 'ARHUS KAMMERORKESTER / Shenzhen (Tony)'
        },
        { id: '1446295', value: 'A  20 ANS', label: 'A  20 ANS / Shenzhen (Tony)' },
        {
            id: '1470439',
            value: 'A  A¡TA DA RADIM',
            label: 'A  A¡TA DA RADIM / Shenzhen (Tony)'
        },
        {
            id: '2210872',
            value: 'A  B�TONS ROMPUS',
            label: 'A  B�TONS ROMPUS / Shenzhen (Tony)'
        },
        {
            id: '2220267',
            value: 'A  BaTONS ROMPUS',
            label: 'A  BaTONS ROMPUS / Shenzhen (Tony)'
        },
        {
            id: '666189',
            value: "A  CA'TA© DE TOI",
            label: "A  CA'TA© DE TOI / Shenzhen (Tony)"
        },
        {
            id: '1351738',
            value: "A  CAUSE DE L'AUTOMNE",
            label: "A  CAUSE DE L'AUTOMNE / Shenzhen (Tony)"
        },
        {
            id: '1350308',
            value: 'A  CAUSE DE MOI',
            label: 'A  CAUSE DE MOI / Shenzhen (Tony)'
        },
        {
            id: '1076006',
            value: 'A  CAUSE DES GARA§ONS',
            label: 'A  CAUSE DES GARA§ONS / Shenzhen (Tony)'
        },
        {
            id: '807675',
            value: 'A  CELENTANO',
            label: 'A  CELENTANO / Shenzhen (Tony)'
        },
        {
            id: '1387376',
            value: 'A  CONTRE SENS',
            label: 'A  CONTRE SENS / Shenzhen (Tony)'
        },
        {
            id: '1312613',
            value: 'A  COUPS DE BATTE [1EYO]',
            label: 'A  COUPS DE BATTE [1EYO] / Shenzhen (Tony)'
        },
        {
            id: '1722933',
            value: 'A  DISNEYLAND PARIS',
            label: 'A  DISNEYLAND PARIS / Shenzhen (Tony)'
        },
        {
            id: '1351586',
            value: 'A  DOG NAMED BLUE',
            label: 'A  DOG NAMED BLUE / Shenzhen (Tony)'
        },
        {
            id: '1160117',
            value: 'A  DOG NAMED BOO',
            label: 'A  DOG NAMED BOO / Shenzhen (Tony)'
        },
        {
            id: '898052',
            value: "A  L'ENVERS A  L'ENDROIT",
            label: "A  L'ENVERS A  L'ENDROIT / Shenzhen (Tony)"
        },
        {
            id: '1976383',
            value: "A  L'ESPACE CITOYEN",
            label: "A  L'ESPACE CITOYEN / Shenzhen (Tony)"
        }
    ]
    )
})

router.post('/createTrack', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Headers", "content-type");
    // res.setHeader("Access-Control-Allow-Methods","PUT, POST, GET, DELETE, PATCH, OPTIONS");
    var form = new IncomingForm();
    form.parse(req, async function (err, params, files) {
        var { track_file } = files;
        let track = Models.Track.fromRequest(params, req.socket.remoteAddress, track_file)
        let result = await track.register();
        return res.json(FormatAnswer({ result }, config.SUCCESS_OBJ));
    });
});

router.post('/getCountryList', async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Headers", "content-type");
    // res.setHeader("Access-Control-Allow-Methods","PUT, POST, GET, DELETE, PATCH, OPTIONS");
    var form = new multiparty.Form();
    form.parse(req, async function (err, params, files) {
        let countries = await Models.Country.getList();
        return res.json(FormatAnswer({ countries }, config.SUCCESS_OBJ));
    });
});

module.exports = router;