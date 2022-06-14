from django.contrib import admin
from django.urls import path
from django.views.generic.base import RedirectView
from django.views.generic import TemplateView
from django.templatetags.static import static

import projects.views


urlpatterns = [
    path('favicon.ico', RedirectView.as_view(url=static('images/icons8-mano-segno-di-pace-50.png'))),
    path('admin/', admin.site.urls),
    path('', projects.views.index, name='index'),
    path('projects/', projects.views.list, name='list_projects'),
    path('projects/<str:project_id>/', projects.views.show, name='show_project'),
]
