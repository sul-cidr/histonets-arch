Histonets
=========

From scanned map images to graph data

.. image:: https://img.shields.io/badge/built%20with-Cookiecutter%20Django-ff69b4.svg
     :target: https://github.com/pydanny/cookiecutter-django/
     :alt: Built with Cookiecutter Django
.. image:: https://circleci.com/gh/sul-cidr/histonets-arch.svg?style=svg
    :target: https://circleci.com/gh/sul-cidr/histonets-arch

:License: MIT


Settings
--------

Moved to settings_.

.. _settings: http://cookiecutter-django.readthedocs.io/en/latest/settings.html

Basic Commands
--------------

Setting Up Your Users
^^^^^^^^^^^^^^^^^^^^^

* To create a **normal user account**, just go to Sign Up and fill out the form. Once you submit it, you'll see a "Verify Your E-mail Address" page. Go to your console to see a simulated email verification message. Copy the link into your browser. Now the user's email should be verified and ready to go.

* To create an **superuser account**, use this command::

    $ python manage.py createsuperuser

For convenience, you can keep your normal user logged in on Chrome and your superuser logged in on Firefox (or similar), so that you can see how the site behaves for both kinds of users.

Test coverage
^^^^^^^^^^^^^

To run the tests, check your test coverage, and generate an HTML coverage report::

    $ coverage run manage.py test
    $ coverage html
    $ open htmlcov/index.html
    $ yarn coverage

Running tests with py.test
~~~~~~~~~~~~~~~~~~~~~~~~~~

::

  $ py.test

And for JS files

::

  $ yarn test

Live reloading and Sass CSS compilation
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Moved to `Live reloading and SASS compilation`_.

.. _`Live reloading and SASS compilation`: http://cookiecutter-django.readthedocs.io/en/latest/live-reloading-and-sass-compilation.html

Webpack hot reloading is also supported by default when files in ``assets`` are modified.


Celery
^^^^^^

This app comes with Celery.

To run a celery worker:

.. code-block:: bash

    cd histonets
    celery -A histonets.taskapp worker -l info

Please note: For Celery's import magic to work, it is important *where* the celery commands are run. If you are in the same folder with *manage.py*, you should be right.

If using Docker, a `Flower`_ image is included listening on port 5555.

.. _flower: https://flower.readthedocs.io/en/latest/


Email Server
^^^^^^^^^^^^

In development, it is often nice to be able to see emails that are being sent from your application. For that reason local SMTP server `MailHog`_ with a web interface is available as docker container.

Container mailhog will start automatically when you will run all docker containers.
Please check `cookiecutter-django Docker documentation`_ for more details how to start all containers.

With MailHog running, to view messages that are sent by your application, open your browser and go to ``http://127.0.0.1:8025``

.. _mailhog: https://github.com/mailhog/MailHog


IIIF Image Server
^^^^^^^^^^^^^^^^^

A dockerized version of Cantaloupe is also available and setup in the compose config file. The service
takes a number of properties defined in a ``cantaloupe.properties`` file and it starts by default at ``http://127.0.0.1:8182`` with the admin interface at ``http://127.0.0.1:8182/admin``.

Images placed in ``/media/iiif`` will get IIIF by default. For example, the image ``/media/iiif/ghostdriver.jpg`` will have its ``info.json`` descriptor at ``http://localhost:8182/iiif/2/ghostdriver.jpg/info.json``, and the image itself will be available at ``http://localhost:8182/iiif/2/ghostdriver.jpg/full/full/0/default.jpg``.


Docker
^^^^^^

A docker-compose config file is provided for local development. For convenience, a couple of scripts are include as well:

* ``scripts/exec.sh``, that runs a command inside a specific container (e.g., ``./scripts/run.sh django flake8``)

* ``scripts/run.sh``, that runs a command in a new container instance (e.g., ``./scripts/run.sh django flake8``)

* ``scripts/dev.sh``, that starts all servers and builds, recreates, or removes images if necessary.

* ``scripts/destroy.sh``, that removes all containers, Docker images, and orphans. The option ``--volumes`` can also be passed in to remove all associated volumes (such as those use by PostgreSQL).


Deployment
----------

The following details how to deploy this application.


Heroku
^^^^^^

See detailed `cookiecutter-django Heroku documentation`_.

.. _`cookiecutter-django Heroku documentation`: http://cookiecutter-django.readthedocs.io/en/latest/deployment-on-heroku.html



Docker
^^^^^^

See detailed `cookiecutter-django Docker documentation`_.

.. _`cookiecutter-django Docker documentation`: http://cookiecutter-django.readthedocs.io/en/latest/deployment-with-docker.html



