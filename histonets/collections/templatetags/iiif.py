from django import template

from histonets.iiif import transform_iiif_image


register = template.Library()
register.simple_tag(transform_iiif_image, name="transform_iiif_image")
