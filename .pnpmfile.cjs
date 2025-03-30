module.exports = {
  hooks: {
    readPackage(pkg) {
      // Set any specific package configurations
      if (pkg.name === 'sharp') {
        // Don't modify the OS/CPU constraints as they're not properly supported
        // Just ensure it's installed
        pkg.dependencies = pkg.dependencies || {};
      }
      
      // Fix the peer dependency issue with react-day-picker and date-fns
      if (pkg.name === 'react-day-picker' && pkg.peerDependencies && pkg.peerDependencies['date-fns']) {
        delete pkg.peerDependencies['date-fns'];
      }
      
      return pkg;
    }
  }
}; 