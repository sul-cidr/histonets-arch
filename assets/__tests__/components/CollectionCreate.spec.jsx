import React from 'react';
import { shallow } from 'enzyme';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import CollectionCreate from '../../components/CollectionCreate';
import manifest from '../__fixtures__/manifest';

const mock = new MockAdapter(axios);


describe('<CollectionCreate>', () => {
  const propImages = [
    {
      uri: 'http://localhost:8182/iiif/2/image1.jpg/full/500,/10/default.jpg',
      label: 'image1',
      selected: true
    }, {
      uri: 'http://localhost:8182/iiif/2/image2.jpg/full/500,/10/default.jpg',
      label: 'image2',
      selected: false
    }
  ];

  it('renders as expected', () => {
    const component = shallow(<CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} />);
    expect(component).toMatchSnapshot();
  });

  it('renders as expected with images', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    expect(component).toMatchSnapshot();
  });

  it('handleSelectImage changes the selected attribute of a specific image in the state from false to true', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    component.instance().handleSelectImage(1);
    expect(component.instance().state.images[1].selected).toBe(true);
  });

  it('handleSelectImage changes the selected attribute of a specific image in the state from true to false', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    component.instance().handleSelectImage(0);
    expect(component.instance().state.images[0].selected).toBe(false);
  });

  it('handleDropAccepted uploads images and return IIIF URIs', done => {
    const uri = '/upload';
    const response = {
      'files': [
        {
          'status': 'ok',
          'uri': 'http://localhost:8182/iiif/2/image.png/full/max/0/default.jpg',
          'label': 'image.png'
        }
      ]
    }
    mock.reset();
    mock.onPost(uri).reply(
      200,
      response,
      {'Content-Type': 'multipart/form-data'}
    );
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state;
    component.instance().handleDropAccepted([{
      'type': 'image/png',
      'name': 'image.png'
    }]).then(() => {
      const currentState = component.instance().state;
      expect(previousState).not.toBe(currentState);
      expect(currentState).toMatchSnapshot();
      done();
    });
  });

  it('handleDropAccepted does nothing with unsupported image types', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    expect(component.instance().handleDropAccepted([{
      type: 'image/unsupported',
      name: 'image.png'
    }])).toBeFalsy();
  });

  it('handleDropRejected handles lists of IIIF URIs', () => {
    const uri = 'http://localhost:8182/iiif/2/image.jpg/full/500,/10/default.jpg';
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state
    component.instance().handleDropRejected([{
      type: 'text/uri-list',
      getAsString: (fn) => fn(uri),
    }]);
    const currentState = component.instance().state;
    expect(previousState).not.toBe(currentState);
    expect(currentState).toMatchSnapshot();
  });

  it('handleProgressEvent updates upload progress', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state;
    const timestamp = 1524252836;  // fixed so the snapshot matches
    component.instance().handleProgressEvent({
      loaded: 50,
      total: 100,
    }, timestamp);
    const currentState = component.instance().state;
    expect(previousState).not.toBe(currentState);
    expect(currentState).toMatchSnapshot();
  });

  it('handleProgressEvent removes progress when done', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousProgress = JSON.stringify(component.instance().state.progress);
    const timestamp = 1524252836;  // fixed so the snapshot matches
    component.instance().handleProgressEvent({
      loaded: 50,
      total: 100,
    }, timestamp);
    let currentProgress = JSON.stringify(component.instance().state.progress);
    expect(previousProgress).not.toBe(currentProgress);
    expect(currentProgress).toMatchSnapshot();
    component.instance().handleProgressEvent({
      loaded: 100,
      total: 100,
    }, timestamp);
    currentProgress = JSON.stringify(component.instance().state.progress);
    expect(previousProgress).toBe(currentProgress);
    expect(currentProgress).toMatchSnapshot();

  });

  it('getGalleryImages retrieves images from state', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    expect(component.instance().getGalleryImages()).toMatchSnapshot();
  });

  it('getImagesFromUri retrieves images from a manifest', done => {
    const uri = '/manifest.json';
    mock.reset();
    mock.onGet(uri).reply(
      200,
      JSON.stringify(manifest),
      {'Accept': 'application/json', 'Content-Type': 'application/json'}
    );
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state
    component.instance().getImagesFromUri(uri).then(() => {
      const currentState = component.instance().state;
      expect(previousState).not.toBe(currentState);
      expect(currentState).toMatchSnapshot();
      done();
    });
  });

  it('getImagesFromUri retrieves images from an info JSON', () => {
    const uri = 'http://localhost:8182/iiif/2/image.jpg/info.json';
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state
    component.instance().getImagesFromUri(uri);
    const currentState = component.instance().state;
    expect(previousState).not.toBe(currentState);
    expect(currentState).toMatchSnapshot();
  });

  it('getImagesFromUri retrieves images from a IIIF canonical image URI', () => {
    const uri = 'http://localhost:8182/iiif/2/image.jpg/full/500,/10/default.jpg';
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state
    component.instance().getImagesFromUri(uri);
    const currentState = component.instance().state;
    expect(previousState).not.toBe(currentState);
    expect(currentState).toMatchSnapshot();
  });

  it('getImagesFromUri returns false for unsupported images URIs', () => {
    const uri = 'http://localhost:8182/iiif/2/image.jpg/full/500,/10/default.gif';
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const consoleWarn = console.warn;
    console.warn = jest.fn();
    expect(component.instance().getImagesFromUri(uri)).toBeFalsy();
    expect(console.warn).toBeCalled();
    console.warn = consoleWarn;
  });

  it('getGalleryImages retrieves images from state', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    expect(component.instance().getGalleryImages()).toMatchSnapshot();
  });

  it('getSelectedImages retrieves selected images from state', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    expect(component.instance().getSelectedImages()).toMatchSnapshot();
  });

  it('getProgressBars retrieves a list of progress bars', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />
    );
    const previousState = component.instance().state;
    const timestamp = 1524252836;  // fixed so the snapshot matches
    component.instance().handleProgressEvent({
      loaded: 50,
      total: 100,
    }, timestamp);
    expect(component.instance().getProgressBars()).toMatchSnapshot();
  });

  it('Dropzon file dialog opens when button is clicked', () => {
    const component = shallow(
      <CollectionCreate uploadUrl='/upload' imageFormats={['png', 'jpg']} images={propImages} />,
    );
    component.instance().dropzone = {open: jest.fn()};
    component.find('button').last().simulate('click');
    expect(component.instance().dropzone.open).toBeCalled();
  });
});
