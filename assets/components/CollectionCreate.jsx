import React, { Component } from 'react';
import PropTypes from 'prop-types';

import axios from 'axios';
import Dropzone from 'react-dropzone';
import Gallery from 'react-grid-gallery';

import { getCookie, removeDuplicates } from '../utils';
import IIIF from '../iiif';


export default class CollectionCreate extends Component {

  constructor(props) {
    super(props);
    this.state = {
      images: props.images,
      progress: {},
      mimes: props.imageFormats.map(format => `image/${format}`)
    }
    this.dropzone = null;
    this.getImagesFromUri = this.getImagesFromUri.bind(this);
    this.getGalleryImages = this.getGalleryImages.bind(this);
    this.getProgressBars = this.getProgressBars.bind(this);
    this.getSelectedImages = this.getSelectedImages.bind(this);
    this.handleSelectImage = this.handleSelectImage.bind(this);
    this.handleDropAccepted = this.handleDropAccepted.bind(this);
    this.handleDropRejected = this.handleDropRejected.bind(this);
    this.handleProgressEvent = this.handleProgressEvent.bind(this);
  }

  getImagesFromUri(uri, label=null) {
    if (uri.endsWith('manifest.json')) {
      // / IIIF Manifest JSON
      return IIIF.getImagesFromIIIFManifest(uri).then(images => this.setState({
        images: removeDuplicates([...this.state.images, ...images], 'uri')
      }))
    }
    const fileExtension = uri.split('/').slice(-1).join().split('.').slice(-1).join()
    let imageUri;
    let imageLabel;
    if (this.props.imageFormats.includes(fileExtension)) {
      // IIIF Image
      imageLabel = label || IIIF.getFilenameFromIIIFImage(uri)
      imageUri = IIIF.getImageUriFromIIIFImage(uri)
    } else if (uri.endsWith('info.json')) {
      // IIIF Info JSON
      imageLabel = label || IIIF.getFilenameFromIIIFInfo(uri)
      imageUri = IIIF.getImageUriFromIIIFInfo(uri)
    }
    if (imageUri) {
      this.setState({
        images: removeDuplicates([
          ...this.state.images,
          {label: imageLabel, uri: imageUri, selected: true}
        ], 'uri')
      });
      return true;
    }
    console.warn(`The resource is not IIIF compliant: ${uri}`);
    return false;
  }

  getGalleryImages() {
    return this.state.images.map(image => ({
      src: IIIF.transformIIIFImage(image.uri, {region: 'square', size: '300,'}),
      thumbnail: IIIF.transformIIIFImage(image.uri, {region: 'square', size: '300,'}),
      thumbnailWidth: 300,
      thumbnailHeight: 300,
      caption: image.label,
      isSelected: image.selected,
      thumbnailCaption: image.label
    }));
  }

  getProgressBars() {
    return Object.values(this.state.progress)
      .map(({loaded, total}) => (
        <progress className="upload-progress" key={null} value={loaded} max={total} />
      ));
  }

  getSelectedImages() {
    return this.state.images.filter(image => image.selected);
  }

  handleSelectImage(index) {
    const images = this.state.images.slice();
    const selectedImage = images[index];
    selectedImage.selected = selectedImage.selected ? !selectedImage.selected : true;
    this.setState({
      images
    });
  }

  handleDropAccepted(files) {
    const imageFiles = files.filter(file => this.state.mimes.includes(file.type))
    if (imageFiles.length > 0) {
      const timestamp = (Date.now() / 1000) | 0; // eslint-disable-line no-bitwise
      const formData = new FormData();
      imageFiles.map(imageFile => formData.append('files', imageFile, imageFile.name));
      formData.append('timestamp', timestamp);
      return axios.post(this.props.uploadUrl, formData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': getCookie('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (
          /* istanbul ignore next: axios mock does not support onUploadProgress */
          event => this.handleProgressEvent(event, timestamp)
        )
      }).then(response => {
        response.data.files
          .filter(file => file.status === 'ok')
          .map(image => this.getImagesFromUri(image.uri, image.label));
      });
    }
      return false; // eslint

  }

  handleDropRejected(files) {
    // Dropped URLs fail to be accepted
    // Issues: https://github.com/react-dropzone/react-dropzone/issues/589
    files
      .filter(file => file.type === 'text/uri-list')
      .map(file => file.getAsString(this.getImagesFromUri))
  }

  handleProgressEvent(progressEvent, timestamp) {
    const { loaded, total } = progressEvent;
    const progress = Object.assign({}, this.state.progress);
    if (loaded === total) {
      delete progress[timestamp];
    } else {
      progress[timestamp] = { loaded, total }
    }
    this.setState({ progress });
  }

  render() {
    return (
      <div>
        <p>
          Drop your files or click
          <button
            className="btn btn-primary"
            onClick={() => { this.dropzone.open() }}
          >
            here
          </button>
          to upload
        </p>
        { this.getProgressBars() }
        <Dropzone
          className='dropzone'
          ref={element => {
            /* istanbul ignore next */
            this.dropzone = element;
          }}
          disableClick
          onDropAccepted={this.handleDropAccepted}
          onDropRejected={this.handleDropRejected}
          disablePreview
          multiple
          accept={`${this.state.mimes},application/json,text/plain,text/uri-list`}
        >
          <Gallery
            className="gallery"
            images={this.getGalleryImages()}
            enableImageSelection
            enableLightbox={false}
            onSelectImage={this.handleSelectImage}
            onClickThumbnail={this.handleSelectImage}
          />
        </Dropzone>
        <input
          type='hidden'
          value={JSON.stringify(this.getSelectedImages())}
          name={this.props.imagesName}
          id={this.props.imagesId}
        />
      </div>
    );
  }
}

CollectionCreate.propTypes = {
  uploadUrl: PropTypes.string.isRequired,
  imageFormats: PropTypes.arrayOf(PropTypes.string).isRequired,
  images: PropTypes.arrayOf(PropTypes.shape({})),
  imagesId: PropTypes.string,
  imagesName: PropTypes.string
};

CollectionCreate.defaultProps = {
  images: [],
  imagesId: 'id',
  imagesName: 'images'
}
