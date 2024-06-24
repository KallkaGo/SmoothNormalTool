import $ from 'jquery'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GLTFExporter } from 'three/examples/jsm/Addons.js'
import { writeAverageNormalToAttribute } from './misc.js'

const gltfLoader = new GLTFLoader()

const input = document.createElement('input')
input.type = 'file'
input.addEventListener('change', (evnet) => {
  const file = event.target.files[0]
  console.log('file', file)
  if (file) {
    const reader = new FileReader()
    reader.onload = function (event) {
      const arrayBuffer = event.target.result
      const blob = new Blob([arrayBuffer])
      const url = URL.createObjectURL(blob)
      gltfLoader.load(url, (gltf) => {
        const model = gltf.scene

        model.traverse((child) => {
          if (child.isMesh) {
            console.log('...', child.name, child)
            writeAverageNormalToAttribute(child)
          }
        })
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

            console.log('An error happened during parsing', error)

          },
          {
            trs: false,
            onlyVisible: true,
            binary: true,
            maxTextureSize: 2048,
          }
        )
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

  const readBtn = c('div')
  $(readBtn).addClass(['btn', 'read']).appendTo(container).html('选择文件')

  $(readBtn).on('click', () => input.click())

}

const saveFile = (data, fileName) => {
  if (link.href) {
    URL.revokeObjectURL(link.href)

  }
  link.href = URL.createObjectURL(data)
  link.download = fileName || 'data.json'
  link.click()
  input.value = ''
}

export {
  createHome
}