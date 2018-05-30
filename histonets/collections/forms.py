import json

from django import forms

from histonets.collections.models import Collection


class CollectionForm(forms.ModelForm):
    images = forms.CharField(widget=forms.Textarea)

    class Meta:
        model = Collection
        fields = ['label', 'description']

    def clean_images(self):
        try:
            return json.loads(self.cleaned_data['images'])
        except:
            raise forms.ValidationError("Invalid data in images")

    def save(self, commit=True):
        super().save(commit=commit)
        for image in self.cleaned_data['images']:
            self.instance.images.create(label=image['label'], uri=image['uri'],
                                        name=image.get('name'))
        return self.instance
