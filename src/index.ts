import fs from 'fs'
import cors from 'cors'
import 'reflect-metadata'
import express from "express"
import 'module-alias/register'
import statuses from 'statuses'
import nnnRouter from "nnn-router"
import 'source-map-support/register'
import promiseRouter from 'express-promise-router'
import * as OpenApiValidator from 'express-openapi-validator'
import errorHandlerMiddleware from '@middleware/error-handler'

express.response.sendStatus = function (statusCode: number) {
  const body = { message: statuses(statusCode) || String(statusCode) }
  this.statusCode = statusCode
  this.type('json')
  return this.send(body)
}

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
  express.urlencoded({ extended: true }),
  express.json(),
  express.text()
)

app.use((req: any, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const mockStaffs = JSON.parse(fs.readFileSync('./mock/staffs.json').toString())
    req.user = mockStaffs[0].email
  } else {
    req.user = req.headers['x-pomerium-claim-email']
  }
  next()
})

app.use(
  OpenApiValidator.middleware({
    apiSpec: 'src/reference/openapi.json',
    validateRequests: true,
    validateResponses: false,
    ignorePaths: (path: string) => path.startsWith('/test'),
  }),
  nnnRouter({ routeDir: '/src/routes', baseRouter: promiseRouter() }),
  errorHandlerMiddleware
)

const port = process.env.PORT || 5000
app.listen(port, () => {
  console.log(`Listening on port ${port}` )
})
