const get404 = (req, res) => {
  res.status(404).send('404 Not Found');
}

export default get404;