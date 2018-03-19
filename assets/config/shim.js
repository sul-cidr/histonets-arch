// Shim for raf for jest testing to remove warning
// until libs are updated to handle this

const requestAnimationFrame = callback => {
  setTimeout(callback, 0);
};

global.requestAnimationFrame = requestAnimationFrame;
export default requestAnimationFrame;
