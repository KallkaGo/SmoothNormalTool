import './style.css'
import $ from 'jquery'
import { createHome } from './src/home.js'
import { createBg } from './src/bg'

$.when($.ready).then(() => {
  const app = document.querySelector('.app')
  createHome(app)
  createBg()
})