const controller = require('../controllers/mainController')
const express = require('express')
const router = express.Router()
const routerExports = {}
module.exports = routerExports

routerExports.router = router
router.get('/', controller.renderIndex)
router.post('/', controller.filesPosted)

routerExports.send = (message) => {
  controller.send(message)
}

routerExports.addClientsReference = (socketInstance) => {
  controller.addClientsReference(socketInstance)
}
