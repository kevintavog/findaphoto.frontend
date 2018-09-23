module.exports = {
  devServer: {
    headers: { "Access-Control-Allow-Origin": "*" },
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