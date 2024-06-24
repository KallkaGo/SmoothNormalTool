import { Bokeh1Background } from './utils/brokenBg'

const createBg = () => {
  const bokeh1Background = Bokeh1Background(document.getElementById('webgl-canvas'))
  bokeh1Background.loadMap('particles.png')
  bokeh1Background.setColors([0x6d4862, 0xfd826c, 0x22ccc1])
  const app = document.getElementById('app')
  app.addEventListener('click', () => {
    bokeh1Background.setColors([0xffffff * Math.random(), 0xffffff * Math.random(), 0xffffff * Math.random()])
  })
}

export { createBg }