<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
*, *:before, *:after {
    box-sizing: border-box;
}
body, html {
    height: 100%;
    overflow: hidden;
}
body, ul {
    margin: 0;
    padding: 0;
}
body {
    color: #4d4d4d;
    font: 14px/1.4em 'Helvetica Neue', Helvetica, 'Microsoft Yahei', Arial, sans-serif;
    background: url('./assets/images/bg.jpg') no-repeat center;
    background-size: cover;
    font-smoothing: antialiased;
}
ul {
    list-style: none;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
