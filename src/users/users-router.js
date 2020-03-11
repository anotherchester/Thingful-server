const express = require('express')
const UserService = require('./users-service');

const usersRouter = express.Router()
const jsonBodyParser = express.json()

usersRouter
  .post('/', jsonBodyParser, (req, res, next) => {
    const { password, user_name, full_name, nickname } = req.body

    for (const field of ['full_name', 'user_name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error:`Missing '${field}' in request body`
        })

    const passwordError = UserService.validatePassword(password)

    if(passwordError) {
      return res.status(400).json({ error: passwordError })
    }
    console.log(`user_name in req.body`, user_name)
    UserService.hasUserWithUserName(
      req.app.get('db'),
      user_name
    )
      .then(hasUserWithUserName => {
        console.log('hasUserWithUserName', hasUserWithUserName)
        if(hasUserWithUserName) {
          return res.status(400).json({ error: `Username already taken`})
        }
      })

    res.send('ok')
  })
    

module.exports = usersRouter

