import * as THREE from 'three'

function writeAverageNormalToAttribute (mesh) {
  return new Promise((resolve, reject) => {
    const averageNormalHash = new Map()
    const position = mesh.geometry.attributes.position
    const tangents = mesh.geometry.attributes.tangent
    const normal = mesh.geometry.attributes.normal
    const uv7 = mesh.geometry.getAttribute('_uv7')

    if (uv7) {
      console.log('_uv7 already exists, deleting it')
      mesh.geometry.deleteAttribute('_uv7')
    }

    if (!tangents) {
      return reject(new Error('No tangents found'))
    }
    if (!normal) {
      return reject(new Error('No normal found'))
    }
    if (!position) {
      return reject(new Error('No position found'))
    }

    for (let j = 0; j < position.count; j++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(position, j)
      const norm = new THREE.Vector3().fromBufferAttribute(normal, j)

      const key = `${vertex.x},${vertex.y},${vertex.z}`
      if (!averageNormalHash.has(key)) {
        averageNormalHash.set(key, norm)
      } else {
        const avgNorm = averageNormalHash.get(key)
        avgNorm.add(norm).normalize()
        averageNormalHash.set(key, avgNorm)
      }
    }

    const averageNormals = []
    for (let j = 0; j < position.count; j++) {
      const vertex = new THREE.Vector3().fromBufferAttribute(position, j)
      const key = `${vertex.x},${vertex.y},${vertex.z}`
      averageNormals.push(averageNormalHash.get(key))
    }

    const avgNormals = new Float32Array(position.count * 3)
    for (let j = 0; j < position.count; j++) {
      const avgNorm = averageNormals[j]
      const nor = new THREE.Vector3().fromBufferAttribute(normal, j)
      const tangent = new THREE.Vector4().fromBufferAttribute(tangents, j)
      const tangentVec3 = new THREE.Vector3(tangent.x, tangent.y, tangent.z)
      tangentVec3.normalize()
      const bitangent = nor.clone().cross(tangentVec3).multiplyScalar(tangent.w)
      bitangent.normalize()

      /* 
      in threejs
  
      https://threejs.org/docs/index.html#api/zh/math/Matrix3

      in glsl

      https://relativity.net.au/gaming/glsl/Variables.html
      */


      const tbnMatrix = new THREE.Matrix3().set(
        tangent.x, bitangent.x, nor.x,
        tangent.y, bitangent.y, nor.y,
        tangent.z, bitangent.z, nor.z
      )

      //wToT = the inverse of tToW = the transpose of tToW as long as tToW is an orthogonal matrix
      tbnMatrix.invert()

      const smoothNormal = avgNorm.clone().applyMatrix3(tbnMatrix).normalize()
      avgNormals[j * 3] = smoothNormal.x
      avgNormals[j * 3 + 1] = smoothNormal.y
      avgNormals[j * 3 + 2] = smoothNormal.z
    }
    /* 
    The custom attribute in GLTFExporter will be prefixed with "_", e.g. "_uv7" in the case of "uv7" attribute.

    See:
    https://github.com/mrdoob/three.js/blob/dcb30fd11276a14255155f3cb6eb3345622c9aef/examples/jsm/exporters/GLTFExporter.js#L1727

    */
    mesh.geometry.setAttribute('uv7', new THREE.BufferAttribute(avgNormals, 3))
    return resolve('done')
  })


}

export {
  writeAverageNormalToAttribute
}