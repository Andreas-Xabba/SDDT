const controller = require('../controllers/mainController')
const express = require('express')
const router = express.Router()
const routerExports = {}
module.exports = routerExports

routerExports.router = router
router.get('/', controller.renderIndex)
router.post('/', controller.filesPosted)

router.get('/scan', controller.renderScan)
router.post('/scan', controller.scanFiles)

router.get('/history', controller.renderHistory)

router.get('/statistics', controller.renderStatistics)

router.get('/settings', controller.renderSettings)

routerExports.send = (message) => {
  controller.send(message)
}

routerExports.addClientsReference = (socketInstance) => {
  controller.addClientsReference(socketInstance)
}
