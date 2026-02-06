from datetime import datetime

def site_settings(request):
    return {
        'SITE_NAME': 'PAMANA Notes',
        'CURRENT_YEAR': datetime.now().year,
        'DEBUG': False
    }
