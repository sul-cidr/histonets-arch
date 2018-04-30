import os
from time import sleep

from django.conf import settings

from celery.utils.log import get_task_logger

from ..taskapp.celery import app

logger = get_task_logger(__name__)


@app.task(bind=True, track_started=True)
def pipeline(self, action):
    terminate = getattr(settings, 'CELERYD_TASK_TERMINATES_WORKER', False)
    queue_name = getattr(settings, 'CELERY_DEFAULT_QUEUE', 'celery')
    if not pipeline.request.is_eager and terminate:
        self.app.control.cancel_consumer(queue_name, reply=False)
    logger.info("Pipeline started [{}]".format(action))
    result = action
    sleep(5)
    logger.info("Pipeline finished [{}]".format(action))
    if pipeline.request.is_eager:
        return result
    elif terminate:
        logger.info("Terminating worker...")
        self.app.control.revoke(pipeline.request.id, terminate=True)
        os.system('kill %d' % os.getppid())  # worker parent must die
    return result
