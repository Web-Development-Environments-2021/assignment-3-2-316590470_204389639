var express = require("express");
var router = express.Router();
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcryptjs");

/* router for registration only,
  if any includes added to route then error is thrown
*/
router.post("/Register", async (req, res, next) => {
  try {
    if( Object.keys(req.query).length > 0 ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    // parameters exists
    // valid parameters
    const { username, first_name, last_name, country,
       password, confirmation_password, email, picture } = req.body;

    if (!(username && first_name && last_name && country &&
      password && confirmation_password && email && picture)){
        throw { status: 400, message: "You must fill all fields"}
      }
    
    const users = await DButils.execQuery(
      "SELECT username, email FROM users"
    );

    if (users.find((x) => x.username === req.body.username))
      throw { status: 409, message: "Username taken" };
    
    if (users.find((x) => x.email === req.body.email)){
      throw { status: 409, message: "email is used already" };
    }
    //hash the password
    let hash_password = bcrypt.hashSync(
      req.body.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    req.body.password = hash_password;
    let users_id = await DButils.execQuery(
      'SELECT * FROM users'
    );
    users_id = users_id.length+1;
    // add the new username
    await DButils.execQuery(
      `INSERT INTO users (user_id, username, password, user_type, email, picture_url)
       VALUES (${users_id}, '${req.body.username}', '${hash_password}', 0, '${req.body.email}', '${req.body.picture}')`
    );

    res.status(201).send("user created");
  } catch (error) {
    next(error);
  }
});

/* router for login only,
  if any includes added to route then error is thrown
*/
router.post("/login", async (req, res, next) => {
  try {
    if( Object.keys(req.query).length > 0  ){
      throw { status: 404, message: "Could not find the requested url"};
    }
    const username = req.body.username;
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE username = '${username}'`
      )
    )[0];
    // user = user[0];
    console.log(user);

    // check that username exists & the password is correct
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "Username or Password incorrect" };
    }

    // Set cookie
    req.session.user_id = user.user_id;

    // return cookie
    res.status(200).send("login succeeded");
  } catch (error) {
    next(error);
  }
});


/* router for logout only,
  if any includes added to route then error is thrown,
  resets cookie session
*/
router.post("/logout", function (req, res) {
  if( Object.keys(req.query).length > 0  ){
    throw { status: 404, message: "Could not find the requested url"};
  }
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.status(205).send({ success: true, message: "logout succeeded" });
});

module.exports = router;
