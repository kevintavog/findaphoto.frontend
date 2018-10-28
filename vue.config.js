module.exports = {
  baseUrl: process.env.NODE_ENV === 'production' ? '/fp2/' : '/',
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