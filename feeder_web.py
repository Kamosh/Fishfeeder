import sys
import os
import feeder

sys.path.append(os.path.join(os.path.dirname(__file__), 'microdot', 'libs', 'common'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'microdot', 'src'))
sys.path.append(os.path.join(os.path.dirname(__file__), 'microdot', 'src', 'microdot'))

print(sys.path)

from microdot import Microdot, send_file, Response
from microdot.utemplate import Template

app = Microdot()

@app.route('/', methods=['GET', 'POST'])
async def index(request):
    print('request.form ', request.form)
    vMessage = None
    vStyle = '""'
    if request.method == 'POST':
        print('request.form.getlist(settings_submit) ', request.form.getlist('settings_submit'))
        print('request.form.getlist(feed_action) ', request.form.getlist('feed_action'))
        if request.form.getlist('settings_submit'):
            timeValues = request.form.getlist('time')
            ticksValues = request.form.getlist('ticks')
            vMessage = feeder.validateValues(timeValues, ticksValues)
            vStyle = 'Invalid'
            if not vMessage:
                feeder.storeSettings(timeValues, ticksValues)
                vMessage = 'Settings saved.'
                vStyle = 'Valid'
    else:
        vMessage = 'Settings restored.'
        vStyle = 'Valid'

    # Show the feeder.html page
    Template.initialize(template_dir=".")
    settings = feeder.loadSettings()

    headers = {'Content-Type': 'text/html'}
    return Response(
        body=Template('feeder.html').render(
            times=settings,
            validationMessage=('"'+vMessage+'"' if vMessage !=None else '""'),
            validationStyle=vStyle,
            minTimeDiff=feeder.MIN_TIME_DIFF,
            minTicks = feeder.MIN_TICKS,
            maxTicks = feeder.MAX_TICKS,
            ticksSettings = feeder.tics_settings),
        status_code=200,
        headers=headers)

@app.route('/feed', methods=['POST'])
async def index(request):
    print('feed request.form ', request.form)
    ticks = request.form.get('ticks')
    print('Feeding for ' + ticks + ' ticks...')
    return 'Feeding for ' + ticks + ' ticks...'

@app.route('/static/<path:path>')
async def static(request, path):
    if '..' in path:
        # directory traversal is not allowed
        return 'Not found', 404
    return send_file('static/' + path)

app.run(debug=True)