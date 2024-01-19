const tableClass = "table";

var _tbody;

const HIDE_CLASS = 'hideInMoment';
const INVALID_CLASS = 'invalid';
const HIDDEN_CLASS = 'hidden';

(function generateTable() {    
    var tbody = document.querySelector("#tblTbody");
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
//    let row = `<td>${rowData[0]}</td>`;
//    tbodyTr.innerHTML = row;
    
    // Time column
    var timeTd = document.createElement("td");
    var timeInput = document.createElement("input");
    timeInput.type = 'time';
    timeInput.value = rowData[0];
    timeInput.required = true;
    timeInput.name = 'time';
    timeInput.addEventListener('blur', (event) => {
        window.setTimeout(() => validateTime(event, timeInput), 0);
    });
    timeTd.appendChild(timeInput);
    //append time column with value to table row
    tbodyTr.appendChild(timeTd);

    // Ticks column
    var ticksTd = document.createElement("td");
    var ticksInput = document.createElement("input");
    ticksInput.type = 'number';
    ticksInput.min = MIN_TICKS;
    ticksInput.max = MAX_TICKS;
    ticksInput.name = 'ticks';
    ticksInput.required = true;
    ticksInput.value = rowData[1];
    ticksTd.appendChild(ticksInput);
    tbodyTr.appendChild(ticksTd);

    // Remove row button
    var buttonTd = document.createElement("td");
    var btnRemove = document.createElement("button");
    var btnRemoveImg = document.createElement("img");
    btnRemoveImg.src="static/trash-svgrepo-com.svg";
    btnRemoveImg.height="15";
    btnRemoveImg.alt="Remove";
    btnRemove.classList.add("delete-button");
    btnRemove.appendChild(btnRemoveImg);    
    btnRemove.addEventListener('mouseup', (event) => {
        // Only primary button was clicked
        if (event.button === 0) {
            deleteRow(tbodyTr);
            //    let row = event.target.closest('tr');
            //    if (row) {
            //        deleteRow(row);
            //    }
        }
    });

    buttonTd.append(btnRemove);
    tbodyTr.appendChild(buttonTd);

    return tbodyTr;
}

function insertRow() {
    var rowData = ['', '35'];
    var tbodyTr = createRow(rowData);
    _tbody.appendChild(tbodyTr);
    tbodyTr.focus();
}

function deleteRow(tr) {
    tr.parentNode.removeChild(tr);    
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

// There should be at least 5 minute delay between times
function validateTime(event, timeInput) {
    if (Array.prototype.slice.apply(timeInput.parentElement.children).indexOf(timeInput) === -1) {
        return;
    }
//    if(true) return;
    var validationError = document.querySelector('#validationError');
    // Convert time to sum of minutes
    var minutes = timeToMinutes(timeInput.value);
    if (minutes === -1) {
        validationError.textContent = 'Set the time.';
        validationError.style.display = 'block';
        setTimeout(function () {
            timeInput.focus();
        }, 10);
        return false;
    }
    // Go through all other TR tags of the same table and 
    // check if there is minimum difference X minutes between all already set times 
    // and currently checked time

    // Get current TR row
    var currTR = timeInput.closest('tr');
    var tblBody = currTR.closest("tbody");
    for (let row of tblBody.rows)
    {
        if (currTR === row) {
            continue;
        }
        var timeCell = row.cells[0];
        {
            let timeCellInput = timeCell.childNodes[0];
            var timeDiff = minutes - timeToMinutes(timeCellInput.value);
            if (timeDiff < (MIN_TIME_DIFF + 1) && timeDiff > -(MIN_TIME_DIFF +1)) {
                timeInput.classList.add('invalid');
                validationError.className = '';
                validationError.textContent = '';
                setTimeout(function () {
                    validationError.classList.add(HIDE_CLASS);
                    validationError.classList.add(INVALID_CLASS);
                    validationError.textContent = 'Minimum time diff is ' + MIN_TIME_DIFF + ' minutes.';                    
                    timeInput.focus();
                }, 10);
                return false;
            }
        }

        validationError.className = '';
        validationError.classList.add(HIDDEN_CLASS);
        validationError.innerText = '&nbsp;';
        timeInput.classList.remove(INVALID_CLASS);
    }
    return true;
}

function timeToMinutes(timeValue) {
    const timeValues = timeValue.split(":");
    if (timeValues.length === 2) {
        return timeValues[0] * 60 + timeValues[1];
    }
    return -1;
}

function validateTimes() {
   var lastElement = document.activeElement;
   if (lastElement.tagName.toLowerCase() === 'input' && lastElement.getAttribute('type') === 'time') {   
       return validateTime(lastElement);
   }
   return true;
}