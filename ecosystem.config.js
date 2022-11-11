module.exports = {
  apps : [{
    name   : "frontend-app-dev",
    script : "./index.js",
    watch: true,
    env:{
      NODE_ENV: "development"
    }
  },{
    name   : "frontend-app-prod",
    script : "./index.js",
    watch: true,
    env: {
      NODE_ENV: "production"
    }
  }]
}
