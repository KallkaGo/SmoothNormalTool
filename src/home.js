
import $ from 'jquery'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GLTFExporter } from 'three/examples/jsm/Addons.js'
import { writeAverageNormalToAttribute } from './misc.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'

let handleDone = true
const gltfLoader = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
gltfLoader.setDRACOLoader(dracoLoader)
const input = document.createElement('input')
input.type = 'file'
input.addEventListener('change', (evnet) => {
  evnet.stopPropagation()
  const file = event.target.files[0]
  if (!handleDone) {
    Firefly.showToast('Please wait for the previous operation to complete')
    input.value = ''
    return
  }
  handleDone = false
  if (file) {
    const reader = new FileReader()
    reader.onload = function (event) {
      const arrayBuffer = event.target.result
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)
      gltfLoader.load(url, (gltf) => {
        const model = gltf.scene
        const taskList = []
        model.traverse((child) => {
          if (child.isMesh) {
            taskList.push(writeAverageNormalToAttribute(child))
          }
        })

        Promise.all(taskList).then(() => {
          // 导出修改后的模型
          const exporter = new GLTFExporter()
          exporter.parse(model, function (result) {

            if (result instanceof ArrayBuffer) {

              saveFile(new Blob([result], { type: 'application/octet-stream' }), file.name)

            } else {

              const output = JSON.stringify(result, null, 2)
              saveFile(new Blob([output], { type: 'text/plain' }), file.name)
            }

          },
            function (error) {
              Firefly.showToast(`An error happened during parsing ${error}`)
            },
            {
              trs: false,
              onlyVisible: true,
              binary: true,
              maxTextureSize: 2048,
            }
          )
        }).catch(() => {
          Firefly.showToast('Please check whether the model contains position normal and tangent data')
        }).finally(() => {
          input.value = ''
          handleDone = true
        })

      })
    }
    reader.readAsArrayBuffer(file)
  }

})

const link = document.createElement('a')
link.style.display = 'none'
document.body.appendChild(link)

const createHome = () => {
  const c = (tagName) => document.createElement(tagName)

  const home = c('div')
  $(home).addClass(['abs', 'full', 'home']).appendTo(app)

  const container = c('div')
  $(container).addClass(['container abs']).appendTo(home)

  const readBtn = c('button')
  $(readBtn).addClass(['btn', 'read']).appendTo(container)

  $(readBtn).on('click', (event) => {
    event.stopPropagation()
    input.click()
  })

  const span = c('span')
  $(span).appendTo(readBtn).html('Select a file')

  const author = c('div')
  $(author).addClass(['author']).appendTo(home)

  const authorSpan = c('span')
  $(authorSpan).html('by').appendTo(author)

  const link = c('a')
  $(link).attr('href', 'https://github.com/KallkaGo').html('KallkaGo').appendTo(author).on('click', (event) => {
    event.preventDefault()
    event.stopPropagation()
    Firefly.jumpLink(event.target.href)
  })



}

const saveFile = (data, fileName) => {
  if (link.href) {
    URL.revokeObjectURL(link.href)

  }
  link.href = URL.createObjectURL(data)
  link.download = fileName || 'data.json'
  link.click()
  input.value = ''
  handleDone = true
}

export {
  createHome
}