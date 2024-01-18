import sys
import os

SETTINGS_FILE = 'times.txt'
MIN_TIME_DIFF = 5 # minutes
MIN_TICKS = 10
MAX_TICKS = 100
tics_settings = 35

def validateValues(timeValues, ticksValues):
    # Same length of time values and time ticks
    if len(timeValues) != len(ticksValues):
        return 'Different count of times %d and ticks %d' % (len(timeValues), len(ticksValues))

    # Time ticks within min max interval
    for ticksValue in ticksValues:
        print(ticksValue)
        print(type(ticksValue))
        print(ticksValue.isnumeric())
        print(ticksValue.isdecimal())
        print((MIN_TICKS <= int(ticksValue) <= MAX_TICKS))
        if not (ticksValue.isdigit() and (MIN_TICKS <= int(ticksValue) <= MAX_TICKS)):
            return  'Invalid ticks value \'%s\'.' % (ticksValue)

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

def storeSettings(timeValues, ticksValues):    
    # Create a dictionary from two lists
    timeAndTicks = {}
    for idx, timeValue in enumerate(timeValues):
        timeAndTicks[timeValue] = int(ticksValues[idx])
   
    # Sort by time
    timeKeys = list(timeAndTicks.keys())
    timeKeys.sort()
    sortedTimeAndTicks = {i: timeAndTicks[i] for i in timeKeys}    
    
    with open(SETTINGS_FILE, 'w') as f:
        for timeValue, ticksValue in sortedTimeAndTicks.items():      
          f.write('%s %d\n' % (timeValue, ticksValue))

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
            settings.append([values[0],int(values[1])]);

    return settings