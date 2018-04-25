from django.contrib import admin
from histonets.collections.models import Collection, Image


class ImageInline(admin.TabularInline):
    model = Image


class CollectionAdmin(admin.ModelAdmin):
    inlines = [
        ImageInline,
    ]

admin.site.register(Collection, CollectionAdmin)
admin.site.register(Image)
