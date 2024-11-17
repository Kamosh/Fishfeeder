var _tbody;

const HIDE_CLASS = 'hideInMoment';
const INVALID_CLASS = 'invalid';
const HIDDEN_CLASS = 'hidden';
const VALID_CLASS = 'valid';
var amountIndex = 0;

//https://www.cssscript.com/developer-date-picker/
const myPicker = new DatePicker({
      el: '#myPicker',
      toggleEl: '#picker-toggle',
      inputEl: '#picker-input',
      type: 'DATEHOUR',
      hourType: '24',
      orientation: 'true',
      allowEmpty: 'false',
      showButtons: 'true'
});

myPicker.el.addEventListener('wdp.open', () => {
    var d = new Date();
    d.setTime(d.getTime() + DIFF_NTP_BROWSER_TIME);
    myPicker.set(d);
});

// Save time from the picker
myPicker.el.addEventListener('wdp.save', () => {
  console.log('save');
  console.log(myPicker.get());
  if (myPicker.get()['value'] === '') {
    showStatusMessage('Not selected any datetime', INVALID_CLASS);
    return;
  };
  let datetime = new Date();
  datetime.setFullYear(myPicker.get()['year']);
  datetime.setMonth(myPicker.get()['month']-1);
  datetime.setDate(myPicker.get()['day']);
  datetime.setHours(myPicker.get()['hour']);
  datetime.setMinutes(myPicker.get()['minute']);
  datetime.setSeconds(0);

  postSaveDatetime(Math.floor(datetime.getTime()/1000));
});

(function registerNtpSynchronization() {
    let ntpButton = document.getElementById('ntp-button');
    ntpButton.addEventListener('click', function() {
        var http = new XMLHttpRequest();
        http.open("POST", "ntpSynchronize", true);

        // Set headers
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function () {
            if (http.readyState === 4 && http.status === 200) {
                console.log(http.responseText);
                setDatetime(http.responseText);
                showStatusMessage('Time synchronized', VALID_CLASS);
            } else {
                showStatusMessage('Failed to synchronize time', INVALID_CLASS);
            }
        };
        http.send();
        return false;
    });
})();

(function generateClock() {
    var span = document.getElementById('clock');

    function time() {
      var d = new Date();
      d.setTime(d.getTime() + DIFF_NTP_BROWSER_TIME);
      var s = d.getSeconds();
      var m = d.getMinutes();
      var h = d.getHours();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      };
      var day = d.toLocaleString('default', options);
      span.textContent =
        day + " " +
        ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2) + ":" + ("0" + s).substr(-2);
    }

    setInterval(time, 1000);
})();

(function generateTable() {
    var tbody = document.querySelector("#tableBodyTimes");
    var t;
    // The times is defined in krmitko.html
    for (t = 0; t < times.length; t++) {
        var tbodyTr = createRow(times[t]);
        tbody.appendChild(tbodyTr);
    }
    _tbody = tbody;

    let cancelButton = document.getElementById("cancel");
    cancelButton.addEventListener("click", onCancelClick);
    cancelButton.addEventListener("keyup", onCancelKey);
})();

function createRow(rowData) {
    var tbodyTr = document.createElement("tr");
    let smallChecked = '';
    let mediumChecked = '';
    let largeChecked = '';
    switch(rowData[1]) {
        case 'S':
            smallChecked = 'checked';
            break;
        case 'M':
            mediumChecked = 'checked';
            break;
        case 'L':
            largeChecked = 'checked';
            break;
    }
    amountIndex++;
    let row = `
        <td>
            <input name='time' type='time' value='${rowData[0]}' required onchange='validateSettings()'>
            <div class='timeError' aria-live='polite'></div>
        </td>
        <td>
            <!-- fieldset-->
              <span>
                <input type="radio" class="input-hidden" id="amount${amountIndex}S" name="amount${amountIndex}" value="S" ${smallChecked}/>
                <label for="amount${amountIndex}S">
                  <img width="50em" src="static/Fisch-lineart.svg#svgView(viewBox(-130,-150,400,400))"/>
                </label>
              </span>

              <span>
                <input type="radio" class="input-hidden" id="amount${amountIndex}M" name="amount${amountIndex}" value="M" ${mediumChecked}>
                <label for="amount${amountIndex}M">
                  <img width="50em" src="static/Fisch-lineart.svg#svgView(viewBox(-50,-60,220,220))"/>
                </label>
              </span>

              <span>
                <input type="radio" class="input-hidden" id="amount${amountIndex}L" name="amount${amountIndex}" value="L" ${largeChecked}/>
                <label for="amount${amountIndex}L">
                  <img width="50em" src="static/Fisch-lineart.svg#svgView(viewBox(0,-10,110,110))">
                </label>
              </span>
            <!-- /fieldset -->
            <!-- input name='ticks' type='number' min=MIN_TICKS max=MAX_TICKS required value='${rowData[1]}' -->
        </td>
        <td>
            <button class='delete-button' onclick='deleteRow(this)'><img src='static/trash-svgrepo-com.svg' alt='Remove' height='20em'></button>
        </td>`;
    tbodyTr.innerHTML = row;
    return tbodyTr;
}

function insertRow() {
    var rowData = ['', 'S'];
    var tbodyTr = createRow(rowData);
    _tbody.appendChild(tbodyTr);
    tbodyTr.focus();
}

function deleteRow(deleteBtn) {
    var currTR = deleteBtn.closest('tr');
    currTR.parentNode.removeChild(currTR);
    validateSettings();
}

function onCancelClick(event) {
    if (!event instanceof MouseEvent || event.button !== 0) {
        event.preventDefault();
        return;
    }
    location.reload();
}

function onCancelKey(event) {
    if (!event instanceof KeyboardEvent || (event.which !== 32 && event.which !== 13) ) {
        event.preventDefault();
        return;
    }
    location.reload();
}

function validateSettings() {
    let tblBody = document.querySelector('#tableBodyTimes');

    // All timeError elements
    let allTimeErrors = [];
    // TimeError elements to show violated minimum time difference
    let minTimeDiffViolated = new Set();

    for (let i = 0; i < tblBody.rows.length; i++)
    {
        let row_1 = tblBody.rows[i];
        let timeTD_1 = row_1.cells[0];
        let timeInput_1 = timeTD_1.children[0];
        let timeError_1 = timeTD_1.querySelector('.timeError');
        allTimeErrors.push(timeError_1);
        let minutes_1 = timeToMinutes(timeInput_1.value);
        if(minutes_1 === -1) {
            continue;
        }
        for (let j = i + 1; j < tblBody.rows.length; j++)
        {
            let row_2 = tblBody.rows[j];
            let timeTD_2 = row_2.cells[0];
            let timeInput_2 = timeTD_2.children[0];
            let timeError_2 = timeTD_2.querySelector('.timeError');
            let minutes_2 = timeToMinutes(timeInput_2.value);
            if (minutes_2 === -1) {
                continue;
            }
            var timeDiff = minutes_1 - minutes_2;
            if (timeDiff < (MIN_TIME_DIFF + 1) && timeDiff > -(MIN_TIME_DIFF +1)) {
                minTimeDiffViolated.add(timeError_1);
                minTimeDiffViolated.add(timeError_2);
            }
        }
    }
    allTimeErrors = allTimeErrors.filter((element) => !minTimeDiffViolated.has(element));

    let result = true;
    // TimeError elements to show violated minimum time difference
    for(let mtd of minTimeDiffViolated) {
       mtd.innerText = 'Min ' + MIN_TIME_DIFF + ' minutes difference';
       result = false;
    }
    for(let te of allTimeErrors) {
        te.innerText = '';
    }

    return result;
}

function timeToMinutes(timeValue) {
    const timeValues = timeValue.split(":");
    if (timeValues.length === 2) {
        return timeValues[0] * 60 + timeValues[1];
    }
    return -1;
}

function postFeed() {
    let amountValue = document.querySelector('input[name="amount"]:checked').value;

    // Parameters to send to /feed endpoint
    let params = "amount=" + amountValue;

    var http = new XMLHttpRequest();
    http.open("POST", "feed", true);

    // Set headers
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            console.log(http.responseText);
            showStatusMessage(http.responseText, VALID_CLASS);
        } else {
            showStatusMessage('Failed to feed', INVALID_CLASS);
        }
    };
    http.send(params);
    return false;
}

function postSaveDatetime(datetime) {//year, month, day, hour, minute) {
    // Parameters to send to /saveTime endpoint
    let params = "datetime="+datetime;// "year=" + year + "&month="+month + "&day=" + day + "&hour=" +hour + "&minute=" + minute;

    var http = new XMLHttpRequest();
    http.open("POST", "saveDatetime", true);

    // Set headers
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            console.log(http.responseText);
            setDatetime(http.responseText);
            showStatusMessage('Datetime saved', VALID_CLASS);
        } else {
            showStatusMessage('Failed to save datetime', INVALID_CLASS);
        }
    };
    http.send(params);
    return false;
}

function showStatusMessage(text, validationClass) {
    let statusMessage = document.querySelector('#statusMessage');
    statusMessage.className = '';
    statusMessage.innerHTML = text;
    statusMessage.classList.add(validationClass);
    setTimeout(function () {
         statusMessage.classList.add(HIDE_CLASS);
         statusMessage.classList.add(INVALID_CLASS);
    }, 10);
}

function setDatetime(currentDatetime) {
    DIFF_NTP_BROWSER_TIME = currentDatetime * 1000 - (new Date().getTime());
}
