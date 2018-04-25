/**
* IIIF helper functions
*/
import axios from 'axios';
import flatten from 'array.prototype.flatten';
import Manifesto from 'manifesto.js';

const getImagesFromIIIFManifest = (uri) => axios
  .get(uri).then(response => Manifesto
    .create(response.data)
    .getSequences()
    .map(seq => seq
      .getCanvases()
      .map(canvas => ({
        label: canvas.__jsonld.label,
        uri: canvas.getCanonicalImageUri()
      }))
    )
  ).then(flatten);

// http://localhost:8182/iiif/2/ghostdriver.jpg/full/500,/10/default.jpg
const getFilenameFromIIIFImage = uri => uri.split('/').slice(-5)[0];

// http://localhost:8182/iiif/2/ghostdriver.jpg/info.json
const getFilenameFromIIIFInfo = uri => uri.split('/').slice(-2)[0];

// http://localhost:8182/iiif/2/ghostdriver.jpg/full/500,/10/default.jpg
const getImageUriFromIIIFImage = uri => {
  const baseUri = uri.split('/').slice(0, -4).join('/')
  return `${baseUri}/full/max/0/default.jpg`;
}

// http://localhost:8182/iiif/2/ghostdriver.jpg/info.json
const getImageUriFromIIIFInfo = uri => {
  const baseUri = uri.split('/').slice(0, -1).join('/')
  return `${baseUri}/full/max/0/default.jpg`;
}

// http://localhost:8182/iiif/2/ghostdriver.jpg/full/500,/10/default.jpg
const transformIIIFImage = (uri, { region = "full", size = "max", rotation = 0, quality = "default" } = {}) => {
  const baseUri = uri.split('/').slice(0, -4).join('/')
  return `${baseUri}/${region}/${size}/${rotation}/${quality}.jpg`;
}

const IIIF = {
  getImagesFromIIIFManifest,
  getFilenameFromIIIFImage,
  getFilenameFromIIIFInfo,
  getImageUriFromIIIFImage,
  getImageUriFromIIIFInfo,
  transformIIIFImage
}
export default IIIF;
