import axios from "axios";
import MockAdapter from "axios-mock-adapter";

import IIIF from '../iiif';

import manifest from "./__fixtures__/manifest.json";

const mock = new MockAdapter(axios);

describe("iiif", () => {
  it("getImagesFromIIIFManifest", done => {
    const uri = '/manifest.json';
    mock.reset();
    mock.onGet(uri).reply(
      200,
      JSON.stringify(manifest),
      {'Accept': 'application/json', 'Content-Type': 'application/json'}
    );
    return IIIF.getImagesFromIIIFManifest(uri).then(images => {
      expect(images).toMatchSnapshot();
      done();
    });
  });

  it("getFilenameFromIIIFImage", () => {
    const uri = "http://localhost:8182/iiif/2/image.jpg/full/500,/10/default.jpg";
    expect(IIIF.getFilenameFromIIIFImage(uri)).toMatchSnapshot();
  });

  it("getFilenameFromIIIFInfo", () => {
    const uri = "http://localhost:8182/iiif/2/image.jpg/info.json";
    expect(IIIF.getFilenameFromIIIFInfo(uri)).toMatchSnapshot();
  });

  it("getImageUriFromIIIFImage", () => {
    const uri = "http://localhost:8182/iiif/2/image.jpg/full/500,/10/default.jpg";
    expect(IIIF.getImageUriFromIIIFImage(uri)).toMatchSnapshot();
  });

  it("getImageUriFromIIIFInfo", () => {
    const uri = "http://localhost:8182/iiif/2/image.jpg/info.json";
    expect(IIIF.getImageUriFromIIIFInfo(uri)).toMatchSnapshot();
  });

  it("transformIIIFImage", () => {
    const uri = "http://localhost:8182/iiif/2/image.jpg/full/500,/10/default.jpg";
    expect(IIIF.transformIIIFImage(uri)).toMatchSnapshot();
  });
});
