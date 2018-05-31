import json
import re
from collections import Counter
from functools import reduce

import histonets_cv as cv

from django.conf import settings
from django.utils.text import re_camel_case


def camel_to_underscore(value):
    """
    Convert a value from camel case convention to underscore lower case convention.
    Args:
        value (str): value in camel case convention.
    Returns:
        value in underscore lowercase convention.
    """
    return re_camel_case.sub(r'_\1', value).strip('_').lower()


def underscore_to_camel(value):
    """
    Convert a value from underscore lower case convention to camel case convention.
    Args:
        value (str): value in underscore lowercase convention.
    Returns:
        value in camel case convention.
    """
    under_pat = re.compile(r'_([a-z])')
    return under_pat.sub(lambda x: x.group(1).upper(), value)


def naming_convention(dic, convert):
    """
    Convert a nested dictionary from one convention to another.
    Args:
        dic (dict): dictionary (nested or not) to be converted.
        convert (func): function that takes the string in one convention and
                        returns it in the other one.
    Returns:
        Dictionary with the new keys.
    """
    new = {}
    for key, value in dic.items():
        converted_value = value
        if isinstance(value, dict):
            converted_value = naming_convention(value, convert)
        elif isinstance(value, list):
            converted_value = []
            for each_value in value:
                if isinstance(each_value, dict):
                    converted_value.append(naming_convention(each_value,
                                                             convert))
                else:
                    converted_value.append(each_value)
        new[convert(key)] = converted_value
    return new


def to_react_props(dic):
    json_props = json.dumps(naming_convention(dic, underscore_to_camel))
    script = """<script>window.props = JSON.parse('{}')</script>"""
    return script.format(json_props)


def download_image_uri_as_array(uri):
    """Download an image from uri and turn it into a Numpy 3D RGB array."""
    return cv.utils.Image.get_images([uri])[0]


def combine_histograms(histograms):
    """Reduce by key summing up the values."""
    return dict(reduce(lambda x, y: x.update(y) or x, histograms, Counter()))
