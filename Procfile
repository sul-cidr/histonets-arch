web: gunicorn config.wsgi:application
worker: celery worker --app=histonets.taskapp --loglevel=info
