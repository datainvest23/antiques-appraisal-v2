function readPackage(pkg) {
  if (pkg.name === 'sharp') {
    pkg.os = ['linux']
    pkg.cpu = ['x64']
  }
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
} 