from django.db import transaction
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Collection, Image
from .tasks import delay, extract_collection_histogram
from ..iiif import delete_uploaded_file


@receiver(post_save, sender=Collection,
          dispatch_uid='create_collection_histogram')
def create_collection_histogram(sender, instance, created, **kwargs):
    if created:
        transaction.on_commit(lambda: delay(extract_collection_histogram,
                                            instance))


@receiver(post_delete, sender=Image,
          dispatch_uid='delete_image_file')
def delete_image_file(sender, instance, **kwargs):
    if instance.name:
        delete_uploaded_file(instance.name)


