from django.shortcuts import render
from django.http import HttpResponse
from django.template import loader

PROJECTS = { 
    'marching_squares': {
        'id': 'marching_squares',  
        'readable': 'Marching Squares',
    },
    'ascii': {
        'id': 'ascii',
        'readable': 'ASCII!',
    },
    'lorem_ipsum': {
        'id': 'lorem_ipsum',
        'readable': 'Lorem Ipsum',
    },
    'prova1': {
        'id': 'prova1',
        'readable': 'Dovrei Finire',
    },
    'prova2': {
        'id': 'prova2',
        'readable': 'Progetti In',
    },
    'prova3': {
        'id': 'prova3',
        'readable': 'Modo Che Questa',
    },
    'prova4': {
        'id': 'prova4',
        'readable': 'Pagina',
    },
    'prova5': {
        'id': 'prova5',
        'readable': 'Sia Piena',
    },
    'prova6': {
        'id': 'prova6',
        'readable': 'Di Cose',
    },
    'prova7': {
        'id': 'prova7',
        'readable': 'Fighe',
    },
    'prova8': {
        'id': 'prova7',
        'readable': 'CIAO stronzi',
    },
}

def index(request):
    # rendering
    template = loader.get_template('index.html')
    context = { 'page_title': 'index', }
    return HttpResponse( template.render(context, request) )

def list(request):
    # content
    description = 'Here are the web version of some of the projects I made. Some of these involve algorithms and data structures and others can be considered in the context of creative coding. Each project is accompanied by a description or at least an overview of its purpose and functioning.'
    # rendering 
    template = loader.get_template('projects/projects_list.html')
    context = {
        'page_title': 'projects',
        'description': description,
        'projects': PROJECTS,
    }
    return HttpResponse( template.render(context, request) )

def show(request, project_id):
    # rendering 
    template = loader.get_template(f'projects/{project_id}.html')
    context = {
        'page_title': PROJECTS[project_id]['readable'],
    }
    return HttpResponse( template.render(context, request) )
