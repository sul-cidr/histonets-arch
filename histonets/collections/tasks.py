import os
import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

import histonets_cv as cv
from celery.utils.log import get_task_logger

from .models import Collection
from ..taskapp.celery import app, task_setup, task_teardown
from ..utils import combine_histograms, download_image_uri_as_array

logger = logging.getLogger(__name__)
task_logger = get_task_logger(__name__)


@app.task(bind=True, track_started=True)
def dispatcher(self, func, options, *args, **kwargs):
    terminate = getattr(settings, 'CELERYD_TASK_TERMINATES_WORKER', False)
    queue_name = getattr(settings, 'CELERY_DEFAULT_QUEUE', 'celery')
    if not dispatcher.request.is_eager and terminate:
        self.app.control.cancel_consumer(queue_name, reply=False)
    task_logger.info("CV started [{}]".format(func))
    result = None
    if func == 'extract_collection_histogram':
        extract_collection_histogram(*args, **kwargs)
    task_logger.info("CV finished [{}]".format(func))
    if dispatcher.request.is_eager:
        return result
    elif terminate:
        task_logger.info("Terminating worker...")
        task_logger.info("Task tearing down:", str(options))
        task_teardown(**options)
        task_logger.info("Revoking:", str(dispatcher.request.id))
        self.app.control.revoke(dispatcher.request.id, terminate=True)
        pid = str(os.getppid())
        task_logger.info("Killing worker parent:", pid)
        os.system("kill {}".format(pid))  # worker parent must die
    return result


def delay(func, *args, **kwargs):
    task_options = task_setup()
    instance, *rest = args
    dispatcher.delay(getattr(func, '__name__', func),
                     task_options,
                     *[getattr(instance, 'pk', instance), *rest],
                     **kwargs)


def extract_collection_histogram(collection_pk):
    collection = Collection.objects.get(pk=collection_pk)
    if not collection.is_histogram_ready():
        task_logger.info(
            "Extracting images histograms for '{}'".format(collection))
        for image in collection.images.filter(histogram__isnull=True):
            image_array = download_image_uri_as_array(image.get_uri())
            image.histogram = cv.histogram_image(image_array, method='hex')
            image.save()
    task_logger.info(
        "Extracting composite histogram for '{}'".format(collection))
    histograms = (collection.images.filter(histogram__isnull=False)
                                   .values_list('histogram', flat=True))
    composite = combine_histograms(histograms)
    collection.histogram = composite
    collection.save()


