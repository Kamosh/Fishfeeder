var _tbody;

const HIDE_CLASS = 'hideInMoment';
const INVALID_CLASS = 'invalid';
const HIDDEN_CLASS = 'hidden';
const VALID_CLASS = 'valid';
var amountIndex = 0;

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
                <input type="radio" class="smallFish" name="amount${amountIndex}" value="S" ${smallChecked}/>
              </span>

              <span>
                <input type="radio" class="mediumFish" name="amount${amountIndex}" value="M" ${mediumChecked}>
              </span>

              <span>
                <input type="radio" class="largeFish" name="amount${amountIndex}" value="L" ${largeChecked}/>
              </span>
            <!-- /fieldset -->
            <!-- input name='ticks' type='number' min=MIN_TICKS max=MAX_TICKS required value='${rowData[1]}' -->
        </td>
        <td>
            <button class='delete-button' onclick='deleteRow(this)'><img src='static/trash-svgrepo-com.svg' alt='Remove' height='15'></button>
        </td>`;
    tbodyTr.innerHTML = row;
    return tbodyTr;
}

function insertRow() {
    var rowData = ['', '35'];
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