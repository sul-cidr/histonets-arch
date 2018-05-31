from django.db import models
from django.conf import settings
if 'postgres' in settings.DATABASES['default']['ENGINE']:
    from django.contrib.postgres.fields import JSONField
else:
    from jsonfield import JSONField


class Collection(models.Model):
    label = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    palette = JSONField(null=True, blank=True)
    histogram = JSONField(null=True, blank=True)

    def is_histogram_ready(self):
        return not self.images.filter(histogram__isnull=True).exists()


class Image(models.Model):
    collection = models.ForeignKey(Collection,
        on_delete=models.CASCADE, related_name='images')
    uri = models.URLField(max_length=500)
    name = models.CharField(max_length=200, null=True, blank=True)
    label = models.CharField(max_length=200, null=True, blank=True)
    histogram = JSONField(null=True, blank=True)

    def get_uri(self):
        if self.name and getattr(settings, 'IIIF_CANONICAL_CONTAINER_URI'):
            return settings.IIIF_CANONICAL_CONTAINER_URI.format(self.name)
        else:
            return self.uri

