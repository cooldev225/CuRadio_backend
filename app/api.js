const express = require('express');
const multiparty = require('multiparty');
const router = express.Router();
const { FormatAnswer, LogError, GetToken } = require('./utils');
const config = require('./config');
const models = require('./db');
const auth_model = require('./modules/auth');

/**
 * Begin of Auth module APIs
 */
router.post('/login', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function(err, params, files) {
        if(
            req.body.submit===undefined||
            req.body.user===undefined||
            req.body.password===undefined
        )
            return res.json(FormatAnswer({message: 'wrong params'}, config.ERROR_OBJ));
        let result = await auth_model.login(req.body);
        return res.json(FormatAnswer({result}, config.SUCCESS_OBJ)); 
    });
});

router.post('/register', async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function(err, params, files) {
        if(
            req.body.user===undefined||
            req.body.email===undefined||
            req.body.password===undefined
        )
            return res.json(FormatAnswer({message: 'wrong params'}, config.ERROR_OBJ));
        let result = await auth_model.register(req.body);
        return res.json(FormatAnswer({result}, config.SUCCESS_OBJ)); 
    });
});

router.post('/getUserInfo', async (req, res) => {
    let token = GetToken(req);
    if(token == ""){
        return res.json(FormatAnswer({message: "authentication failure!"}, config.SUCCESS_OBJ));    
    }
    let result = await auth_model.getUserInfo(token);
    return res.json(FormatAnswer({result}, config.SUCCESS_OBJ));
});

router.post('/setUserInfo', async (req, res) => {
    let token = GetToken(req);
    if(token == ""){
        return res.json(FormatAnswer({message: "authentication failure!"}, config.SUCCESS_OBJ));    
    }
    let result = await auth_model.setUserInfo(token, req.body);
    return res.json(FormatAnswer({result}, config.SUCCESS_OBJ)); 
});

router.post('/__gg_user', async (req, res) => {
    let result = await auth_model.__gg_user();
    return res.json(FormatAnswer({result}, config.SUCCESS_OBJ));
});
/**
 * End of Auth module APIs
 */

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

module.exports = router;