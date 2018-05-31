from pathlib import Path
from urllib.parse import quote, unquote

from django.conf import settings
from django.core.files.storage import default_storage
from django.utils.text import slugify


def save_uploaded_file(prefix, uploaded_file):
    name, ext = uploaded_file.name.rsplit(".", 1)
    filename = "{}.{}".format(slugify(name), ext)
    iiif_path = Path(settings.IIIF_DIR) / prefix / filename
    iiif_unique_path = default_storage.save(str(iiif_path), uploaded_file)
    iiif_uri = quote(iiif_unique_path.replace(settings.IIIF_DIR, "")[1:],
                     safe="")
    return iiif_uri


def delete_uploaded_file(uploaded_filename):
    iiif_path = Path(settings.IIIF_DIR) / unquote(uploaded_filename)
    default_storage.delete(str(iiif_path))


def transform_iiif_image(uri, region="full", size="max", rotation=0,
                         quality="default"):
    # http://localhost:8182/iiif/2/ghostdriver.jpg/full/500,/10/default.jpg
    base_uri = uri.rsplit('/', 4)[0]
    return "{base_uri}/{region}/{size}/{rotation}/{quality}.jpg".format(
        base_uri=base_uri, region=region, size=size, rotation=str(rotation),
        quality=quality
    );
