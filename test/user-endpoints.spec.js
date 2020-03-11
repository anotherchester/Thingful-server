const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Users Endpoints', function () {
  let db

  const { testUsers } = helpers.makeThingsFixtures()
  const testUser = testUsers[0]

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers,
        )
      )

      const requiredFields = ['user_name', 'password', 'full_name']

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          user_name: 'test user_name',
          password: 'test password',
          full_name: 'test full_name',
          nickname: 'test nickname',
        }

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field]

          return supertest(app)
            .post('/api/users')
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`,
            })
        })
      })

      it(`responds with 400 'Password needs to be longer than 8 characters' if password is less than 8 char long`, () => {
        const userShortPassword = {
          user_name: 'test user_name',
          password: '1234',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userShortPassword)
          .expect(400, { error: `Password needs to be longer than 8 characters` })
      })

      it(`responds with 400 'Password must be less than 72 characters' when more than 72 characters in password`, () => {
        const userLongPassword = {
          user_name: 'test user_name',
          password: '*'.repeat(73),
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userLongPassword)
          .expect(400, { error: `Password must be less than 72 characters` })
      })

      it(`responds with 400 'Password must not start or end with empty space' when password starts with space`, () => {
        const userPasswordStartsWithSpace = {
          user_name: 'test user_name',
          password: ' 1Aa!2Bb@',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsWithSpace)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })

      it(`responds with 400 'Password must not start or end with empty space' when password ends with space`, () => {
        const userPasswordEndsSpace = {
          user_name: 'test user_name',
          password: '1Aa!2Bb@ ',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpace)
          .expect(400, { error: `Password must not start or end with empty spaces` })
      })

      it(`responds with 400 error when password isn't complex enough`, () => {
        const userPasswordNotComplex = {
          user_name: 'test user_name',
          password: '11AAaabboo',
          full_name: 'test full_name',
        }
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, { error: `Password must contain 1 upper case, lower case, number and special character` })
      })

      it(`responds with 400 error when user_name is not unique`, () => {
        const duplicateUser = {
          user_name: testUser.user_name,
          password: '11AAaa!!oo',
          full_name: 'test full_name',
        }
        console.log(`duplicate`, duplicateUser.user_name)
        console.log(`seeded into db`, testUsers[0])
        return supertest(app)
          .post('/api/users')
          .send(duplicateUser)
          .expect(400, { error: `Username already taken` })
      })
    })
  })
})
