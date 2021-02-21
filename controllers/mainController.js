const controller = {}
module.exports = controller

let clients

controller.renderIndex = (req, res) => {
  res.render('index', { layout: 'main' })
}

controller.filesPosted = (req, res) => {
  console.log(req.body)
}

controller.addClientsReference = (clientsRef) => {
  clients = clientsRef
  console.log(clients)
}
