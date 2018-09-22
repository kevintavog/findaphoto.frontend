module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
      },
      "/files": {
        target: "http://localhost:5000",
      }
    }
  }
}