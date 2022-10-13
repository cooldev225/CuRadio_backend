const express = require('express');
const multiparty = require('multiparty');
const router = express.Router();
const { FormatAnswer, LogError } = require('./utils');
const config = require('./config');
const models = require('./db');

router.get('/test', async (req, res) => {
    let result = {'message':'ok'};
    return res.json(FormatAnswer({result}, config.SUCCESS_OBJ));
});

router.post('/getRMS', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function(err, params, files) {
        if(params===null||params===undefined||params.a===undefined||params.f===undefined||params.cugate_track_id===undefined||params.time_period===undefined)
            return res.json(FormatAnswer({message: 'wrong params'}, config.ERROR_OBJ));
        let result = await models.getRMS(params);
        return res.json(FormatAnswer({result}, config.SUCCESS_OBJ)); 
    });
});

router.post('/getTrackInfo', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function(err, params, files) {
        if(params===null||params===undefined||params.id===undefined||params.id<=0)
            return res.json(FormatAnswer({message: 'wrong params'}, config.ERROR_OBJ));
        let result = await models.getTrackInfo(params.id);
        return res.json(FormatAnswer({result}, config.SUCCESS_OBJ)); 
    });
});

router.get('/log', async(req, res) => {
	LogError(req.body.type, req.body.error);
	return res.json(FormatAnswer(config.SUCCESS_OBJ));
});

router.all('/*', (req, res) => {
    return res.json(FormatAnswer({message: 'Empty transaction'}, config.ERROR_OBJ));
});

module.exports = router;