import os

from django.contrib.auth.management.commands import createsuperuser
from django.core.management import CommandError, call_command


class Command(createsuperuser.Command):
    help = 'Run migrations and create a superuser from env vars'

    def add_arguments(self, parser):
        super(Command, self).add_arguments(parser)
        parser.add_argument(
            '--password', dest='password', default=None,
            help='Specifies the password for the superuser.',
        )
        parser.add_argument(
            '--reset', dest='reset', action='store_true',
            help='Resets the password if the user already exists.',
        )

    def handle(self, *args, **options):
        password = options.get('password') or os.getenv('DJANGO_ADMIN_PASSWORD')
        username = options.get('username') or os.getenv('DJANGO_ADMIN_USERNAME')
        email = options.get('email') or os.getenv('DJANGO_ADMIN_EMAIL')
        database = options.get('database')
        reset = options.get('reset')
        manager = self.UserModel._default_manager.db_manager(database)
        if not all((username, password, email)):
            raise CommandError(
                'Fields username, password, and email are required.'
            )
        # Migrate
        call_command('migrate', interactive=False,
                     stdout=self.stdout, stderr=self.stderr)
        # Create superuser
        self.stdout.write(self.style.MIGRATE_HEADING('Creating super user:'))
        exists = manager.filter(username=username).exists()
        if exists and not reset:
            self.stdout.write('Superuser already exists, exiting normally.')
            return
        elif not exists:
            options.update({
                'username': username,
                'password': password,
                'email': email,
                'interactive': False,
            })
            super(Command, self).handle(*args, **options)

        user = manager.get(username=username)
        user.email = email
        user.set_password(password)
        user.save()
        self.stdout.write('  Superuser password successfully set.')
