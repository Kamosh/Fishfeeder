import sys
import os
import feeder
import ntplib
import timeutil
import logging

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
        if request.form.getlist('settings_submit'):
            (timeValues, amountValues) = parseTimesAndAmounts(request.form)
            vMessage = feeder.validateValues(timeValues, amountValues)
            vStyle = 'Invalid'
            if not vMessage:
                feeder.storeSettings(timeValues, amountValues)
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
            ticksSettings = feeder.tics_settings,
            currentDatetime = timeutil.currentTime()),
        status_code=200,
        headers=headers)

# request.form data, epoch millis
# {'datetime': ['1706984700965']}
@app.route('/saveDatetime', methods=['POST'])
async def saveDatetime(request):
    print('saveTime request.form ', request.form)
    timeutil.setCurrentTime(int(request.form.get('datetime')))
    return str(timeutil.currentTime())
    #return 'SaveDatetime'

# request.form data
# {'amount': ['S']}
@app.route('/feed', methods=['POST'])
async def feed(request):
    print('feed request.form ', request.form)
    amount = request.form.get('amount')
    feeder.feed(amount)
    print('Feeding with ' + amount + ' amount...')
    return 'Feeding with ' + amount + ' amount...'

@app.route('/ntpSynchronize', methods=['POST'])
async def ntpSynchronize(request):
    print('ntpSynchronize request.form ', request.form)
    ntp_time = timeutil.getNtpTime() /1000
    print('ntp_time ', ntp_time)
    timeutil.setCurrentTime(ntp_time)
    return str(timeutil.currentTime())

@app.route('/static/<path:path>')
async def static(request, path):
    if '..' in path:
        # directory traversal is not allowed
        return 'Not found', 404
    return send_file('static/' + path)

def parseTimesAndAmounts(settings_form_values):
    timeValues = settings_form_values.getlist('time')
    amountValues = []
    for key in settings_form_values.keys():
        if key.startswith('amount'):
            amountValues.append(settings_form_values.get(key))

    print('timeValues ', timeValues)
    print('amountValues ', amountValues)
    return (timeValues, amountValues)

app.run(debug=True)