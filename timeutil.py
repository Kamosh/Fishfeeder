import time
import ntplib
from time import ctime

datetime_diff = -time.time()

def getNtpTime():
    c = ntplib.NTPClient()
    response = c.request('europe.pool.ntp.org', version=3)
    resultTime = ctime(response.tx_time)
    print(resultTime) #'Sun May 17 09:32:48 2009'
    print(response.tx_time)
    # Return time in millis
    ntpTime = round(response.tx_time * 1000) # Minus one hour - (1000*60*60*2)
    print('ntpTime ', ntpTime)
    return ntpTime

def currentTime():
    print('currentTime called')
    global datetime_diff
    print('datetime_diff ', datetime_diff)
    print('currentTime ', time.time() + datetime_diff)
    return time.time() + datetime_diff

def setCurrentTime(datetime):
    print('setCurrentTime ', datetime)
    print('time.time() ', time.time())
    global datetime_diff
    datetime_diff = datetime - time.time()
    print('datetime_diff ', datetime_diff)