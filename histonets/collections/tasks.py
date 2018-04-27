from celery import shared_task


@shared_task
def pipeline(action, *args, **kwards):
    return action
