import './style.css'
import $ from 'jquery'
import { createHome } from './src/home.js'


$.when($.ready).then(() => {
  const app = document.querySelector('.app')
  createHome(app)
})