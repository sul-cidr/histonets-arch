from django.urls import path

from . import views

app_name = 'collections'
urlpatterns = [
    path('', views.index, name='index'),
    path('create', views.create, name='create'),
    path('edit/<int:pk>', views.CollectionUpdate.as_view(), name='edit'),
    path('delete/<int:pk>', views.CollectionDelete.as_view(), name='delete'),
    path('upload', views.upload, name='upload'),
]
