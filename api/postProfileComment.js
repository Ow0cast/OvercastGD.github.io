const request = require('request')
const XOR = require('../classes/XOR.js');
const xor = new XOR();
const crypto = require('crypto')
function sha1(data) { return crypto.createHash("sha1").update(data, "binary").digest("hex"); }

module.exports = async (app, req, res) => {

  if (!req.body.comment) return res.status(400).send("No comment provided!")
  if (!req.body.username) return res.status(400).send("No username provided!")
  if (!req.body.accountID) return res.status(400).send("No account ID provided!")
  if (!req.body.password) return res.status(400).send("No password provided!")

  if (req.body.comment.includes('\n')) return res.status(400).send("Profile posts cannot contain line breaks!")
  
  let params = {
    gameVersion: '21',
    binaryVersion: '35',
    secret: app.secret,
    cType: '1'
  }

  params.comment = new Buffer(req.body.comment.slice(0, 190) + (req.body.color ? "⍟" : "")).toString('base64').replace(/\//g, '_').replace(/\+/g, "-")
  params.gjp = xor.encrypt(req.body.password, 37526)
  params.accountID = req.body.accountID.toString()
  params.userName = req.body.username

  let chk = params.userName + params.comment + "1xPT6iUrtws0J"
  chk = sha1(chk)
  chk = xor.encrypt(chk, 29481)
  params.chk = chk

  request.post('http://boomlings.com/database/uploadGJAccComment20.php', {
    form: params
  }, function (err, resp, body) {
    if (err) return res.status(400).send("The Geometry Dash servers returned an error! Perhaps they're down for maintenance")
    if (!body || body == "-1") return res.status(400).send("The Geometry Dash servers rejected your profile post! Try again later, or make sure your username and password are entered correctly.")
    res.status(200).send(`Comment posted to ${params.userName} with ID ${body}`)
  })
}