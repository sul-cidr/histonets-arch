import os
from io import StringIO

from django.core.management import CommandError, call_command
from django.test import TestCase


class ClosepollTest(TestCase):
    def setUp(self):
        os.environ['DJANGO_ADMIN_USERNAME'] = ''
        os.environ['DJANGO_ADMIN_PASSWORD'] = ''
        os.environ['DJANGO_ADMIN_EMAIL'] = ''
        del os.environ['DJANGO_ADMIN_USERNAME']
        del os.environ['DJANGO_ADMIN_PASSWORD']
        del os.environ['DJANGO_ADMIN_EMAIL']

    def test_username_required(self):
        out = StringIO()
        with self.assertRaises(CommandError) as error:
            call_command('post_deploy', password='pass', email='mail@mail.com',
                         stdout=out)
        self.assertEqual('Fields username, password, and email are required.',
                         str(error.exception))

    def test_password_required(self):
        out = StringIO()
        with self.assertRaises(CommandError) as error:
            call_command('post_deploy', username='user', email='mail@mail.com',
                         stdout=out)
        self.assertEqual('Fields username, password, and email are required.',
                         str(error.exception))

    def test_email_required(self):
        out = StringIO()
        with self.assertRaises(CommandError) as error:
            call_command('post_deploy', password='pass', username='user',
                         stdout=out)
        self.assertEqual('Fields username, password, and email are required.',
                         str(error.exception))

    def test_migrate_superuser_creation(self):
        out = StringIO()
        call_command('post_deploy', username='user', password='pass',
                     email='mail@mail.com', stdout=out)
        output = out.getvalue()
        self.assertIn('Running migrations:', output)
        self.assertIn('No migrations to apply.', output)
        self.assertIn('Creating super user:', output)
        self.assertIn('Superuser created successfully.', output)
        self.assertIn('Superuser password successfully set.', output)

    def test_env_vars(self):
        os.environ['DJANGO_ADMIN_USERNAME'] = 'user'
        os.environ['DJANGO_ADMIN_PASSWORD'] = 'pass'
        os.environ['DJANGO_ADMIN_EMAIL'] = 'mail@mail.com'
        out = StringIO()
        call_command('post_deploy', stdout=out)
        output = out.getvalue()
        self.assertIn('Running migrations:', output)
        self.assertIn('No migrations to apply.', output)
        self.assertIn('Creating super user:', output)
        self.assertIn('Superuser created successfully.', output)
        self.assertIn('Superuser password successfully set.', output)

    def test_reset_option_true(self):
        out = StringIO()
        call_command('post_deploy', username='user', password='pass',
                     email='mail@mail.com', stdout=out)
        # Run it twice to test the reset option
        out = StringIO()
        call_command('post_deploy', username='user', password='pass',
                     email='mail@mail.com', reset=True, stdout=out)
        output = out.getvalue()
        self.assertIn('Running migrations:', output)
        self.assertIn('No migrations to apply.', output)
        self.assertIn('Creating super user:', output)
        self.assertNotIn('Superuser already exists, exiting normally.', output)
        self.assertNotIn('Superuser created successfully.', output)
        self.assertIn('Superuser password successfully set.', output)

    def test_reset_option_false(self):
        out = StringIO()
        call_command('post_deploy', username='user', password='pass',
                     email='mail@mail.com', stdout=out)
        # Run it twice to test the reset option
        out = StringIO()
        call_command('post_deploy', username='user', password='pass',
                     email='mail@mail.com', reset=False, stdout=out)
        output = out.getvalue()
        self.assertIn('Running migrations:', output)
        self.assertIn('No migrations to apply.', output)
        self.assertIn('Creating super user:', output)
        self.assertIn('Superuser already exists, exiting normally.', output)
        self.assertNotIn('Superuser created successfully.', output)
        self.assertNotIn('Superuser password successfully set.', output)
