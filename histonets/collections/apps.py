from django.apps import AppConfig


class CollectionsConfig(AppConfig):
    name = 'histonets.collections'
    verbose_name = "Collections"

    def ready(self):
        from .signals import (
            create_collection_histogram,
            delete_image_file
        )  # noqa
