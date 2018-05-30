import imghdr
import os.path

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse, reverse_lazy
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.generic.edit import DeleteView, UpdateView

from .forms import CollectionForm
from .models import Collection
from ..iiif import save_uploaded_file
from ..utils import to_react_props


class CollectionDelete(DeleteView):
    model = Collection
    success_url = reverse_lazy('collections:index')


class CollectionUpdate(UpdateView):
    model = Collection
    fields = ['label']
    success_url = reverse_lazy('collections:index')


@login_required
def index(request):
    context = {'collections': Collection.objects.all()}
    return render(request, 'collections/index.html', context)


@transaction.atomic
@login_required
def create(request):
    images = []
    form = CollectionForm()
    if request.method == 'POST':
        form = CollectionForm(request.POST)
        if form.is_valid():
            form.save()
            return HttpResponseRedirect(reverse('collections:index'))
        images = form.cleaned_data['images']
    props = {
        'upload_url': reverse('collections:upload'),
        'image_formats': settings.IIIF_IMAGE_FORMATS,
        'images': images,
        'images_id': form['images'].id_for_label,
        'images_name': form['images'].html_name,
    }
    context = {'form': form, 'props': to_react_props(props)}
    return render(request, 'collections/create.html', context)


@login_required
@ensure_csrf_cookie
def upload(request):
    files = request.FILES.getlist('files')
    if request.method == 'POST' and files:
        files_info = []
        for file in files:
            file_format = imghdr.what(file='', h=file.read())
            if file_format in settings.IIIF_IMAGE_FORMATS:
                iiif_uri_name = save_uploaded_file(request.user.username, file)
                iiif_uri = settings.IIIF_CANONICAL_URI.format(iiif_uri_name)
                files_info.append({
                    'status': 'ok',
                    'name': iiif_uri_name,
                    'uri': iiif_uri,
                    'label': file.name
                })
            else:
                files_info.append({
                    'status': 'error',
                    'message': 'Image format not recognized',
                    'label': file.name
                })
        response = JsonResponse({'files': files_info})
    else:
        response = JsonResponse({}, status=403)
    return response
