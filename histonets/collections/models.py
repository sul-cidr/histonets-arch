from django.db import models
from django.conf import settings
if 'postgres' in settings.DATABASES['default']['ENGINE']:
    from django.contrib.postgres.fields import JSONField
else:
    from jsonfield import JSONField


class Collection(models.Model):
    label = models.CharField(max_length=200)
    palette = JSONField(null=True, blank=True)


class Image(models.Model):
    collection = models.ForeignKey(Collection,
        on_delete=models.CASCADE, related_name='images')
    uri = models.URLField(max_length=500)
    label = models.CharField(max_length=200, blank=True)
    histogram = JSONField(null=True, blank=True)
