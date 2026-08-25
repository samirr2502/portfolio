const app = require('./service.js');

const port = process.argv[2] || process.env.PORT || 3020;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
