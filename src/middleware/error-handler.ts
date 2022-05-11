export default (error: any, req: any, res: any, next: any): Response => {
  console.error(error)
  if (error.name === 'HTTPError') {
    return res.status(error.response.statusCode)
      .send({ message: error.message })
  }
  return res.sendStatus(error.status || 500)
}
