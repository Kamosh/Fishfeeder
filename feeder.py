import sys
import os
import time

SETTINGS_FILE = 'times.txt'
MIN_TIME_DIFF = 5 # minutes
MIN_TICKS = 10
MAX_TICKS = 100
tics_settings = 35

SMALL_AMOUNT = 'S'
MEDIUM_AMOUNT = 'M'
LARGE_AMOUNT = 'L'
ALL_AMOUNTS = set([SMALL_AMOUNT, MEDIUM_AMOUNT, LARGE_AMOUNT])

datetime_diff = -time.time()

def validateValues(timeValues, amountValues):
    # Same length of time values and amount values
    if len(timeValues) != len(amountValues):
        return 'Different count of times %d and ticks %d' % (len(timeValues), len(amountValues))

    # Time ticks within min max interval
    for amountValue in amountValues:
        #print((MIN_TICKS# <= int(ticksValue) <= MAX_TICKS))
        if amountValue not in ALL_AMOUNTS:
        #if not (ticksValue.isdigit() and (MIN_TICKS <= int(ticksValue) <= MAX_TICKS)):
            return  'Invalid amount value \'%s\'.' % (amountValue)

    # Validate that there is always delay 5 minutes between times
    i = 0
    while i < len(timeValues):
        t1 = convertTimeToMinutes(timeValues[i])        
        j = i + 1
        while j < len(timeValues):
            if t1 == -1:
                return 'Specified time value %s cannot be converted to daytime.' % (timeValues[i])
            else:
                t2 = convertTimeToMinutes(timeValues[j])
                if t2 == -1:
                    return 'Specified time value %s cannot be converted to daytime.' % (timeValues[j])
                else:
                    timeDiff = t2 - t1
                    if timeDiff < (MIN_TIME_DIFF + 1) and timeDiff > -(MIN_TIME_DIFF +1):
                        return 'Minimum difference between times %s and %s is less than %s minutes.' % (timeValues[i], timeValues[j], MIN_TIME_DIFF)
            j = j + 1        
        i = i + 1
    return None
    
def convertTimeToMinutes(timeValue):
    splitTime = timeValue.split(':')
    if len(splitTime) != 2:
        return -1;
    else:
        return 60 * int(splitTime[0]) + int(splitTime[1])

def storeSettings(timeValues, amountValues):
    # Create a dictionary from two lists
    timeAndAmounts = {}
    for idx, timeValue in enumerate(timeValues):
        timeAndAmounts[timeValue] = amountValues[idx]

    # Sort by time
    timeKeys = list(timeAndAmounts.keys())
    timeKeys.sort()
    sortedTimeAndAmounts = {i: timeAndAmounts[i] for i in timeKeys}

    with open(SETTINGS_FILE, 'w') as f:
        for timeValue, amountValue in sortedTimeAndAmounts.items():
          f.write('%s %s\n' % (timeValue, amountValue))

def loadSettings():
    settings = []
    if not os.path.isfile(SETTINGS_FILE):
        return settings

    with open(SETTINGS_FILE, 'r') as f:
        while True:
            # Get next line from file
            line = f.readline()

            # if line is empty
            # end of file is reached
            if not line:
                break
            values = line.strip().split(' ')
            settings.append([values[0],values[1]]);

    return settings

def feed(amount):
    print('Feeder %s' % amount)

def currentTime():
    print('currentTime')
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