'use strict';

chrome.runtime.onInstalled.addListener(function() {
  var list = new Object();
  var links = new Object();
  var arr = [];
  chrome.storage.sync.set(
    {
      //Counter for the length of current unhidden checklist items
      itemLength:'',
      //Hashtable for retrieving index values for checklist categories
      indexHash:list,
      //Double array for storing checklist categories with items
      checkList:arr,
      //Starting category opened for checklists
      startCategory:'All',
      //Hashtable for retrieving links and titles
      savedLinks:links
    }, 
    function(){
      console.log('Data set!');
    }
  );
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostContains : '.'},
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
  
});

//Web ctrl interaction
chrome.commands.onCommand.addListener(function(command){
  chrome.tabs.executeScript({ file: 'js/getWebText.js'});
});

chrome.alarms.onAlarm.addListener(function(alarm){

  var name = alarm.name;
  var time = name.substring(name.length-8);
  if(name.substring(0,1) == '?'){
    var inp_time = toMilitary(time);
    var inp_mes = name.substring(3,name.length-8);
    createTimeAlarm(inp_time,inp_mes,true);
  }
  if(name.substring(0,4) == '/os:'){
    try {
      var index = name.substring(4)-1;
      chrome.storage.sync.get(['savedLinks'],function(result){
        var url = Object.keys(result.savedLinks)[index];
        if(url != undefined){
          window.open(url);
        }
      });
    }catch(err) {
      alert(err.message);
    }
  }else if(name.substring(3,7) == '/os:'){
    try {
      var index = name.substring(7,name.length-8)-1;      
      chrome.storage.sync.get(['savedLinks'],function(result){
        var url = Object.keys(result.savedLinks)[index];
        if(url != undefined){
          window.open(url);
        }
      });
    }catch(err) {
      alert(err.message);
    }
  }else if(name.substring(1,3) == '%)'){
    name = name.substring(3,name.length-8);
    alert(name + ' at ' + time);
  }else{
    alert(name);
  }
});

function createTimeAlarm(inp_time,inp_mes,repeat){
  //Date now
  var date = new Date();
  var now_date = date.toLocaleDateString();

  //Alarm time assuming the date is the same
  var alarm_str = now_date + " " + inp_time;  //inp_time is military
  var alarm_time = new Date(alarm_str);       //Milliseconds for alarm time
      
  //Get time now
  var now_time = date.getTime();

  /* Check if the date is today or tomorrow
     Alarm time has to be greater than current time
     If alarm time is less, then increase the day by one */
  if(alarm_time <= now_time){
    var temp_date = new Date();
    temp_date.setDate(temp_date.getDate() + 1);
    var tom_date = temp_date.toLocaleDateString();
    var tom_str = tom_date + " " + inp_time;
    alarm_time = new Date(tom_str);
  }
  var diff = alarm_time - now_time;
  var set_minutes = toMinutes(diff);

  //Create the time alarm
  var alarmInfo = {
      when: Date.now() + diff
  };

  if(repeat){
    inp_mes = "?%)" + inp_mes + toStandardTime(inp_time); //?%) means that the alarm is time and repeated
  } else{
    var stand = toStandardTime(inp_time);
    var sub = inp_mes + " at " + stand;
    $('#alarms').append('<input id="a2" type="checkbox"><a3>'+sub+'</a3>');
    inp_mes = "!%)" + inp_mes + stand; //!%) means that it is a nonrepeating time alarm
  }
  chrome.alarms.create(inp_mes, alarmInfo); 
}

function toStandardTime(mtime){
  var mhour = mtime.substring(0,2);
    var mmin = mtime.substring(3);

  var ampm = 'PM';
  if((0 <= mhour) && (mhour<12)){
    ampm = 'AM';
  }
  if (mhour == 0){
    mtime = '12:' + mmin + ' AM';
  }
    else if(mhour == 24){
      mtime = '12:00 AM';
    }
    else if (ampm == 'PM' && mhour != 12){
    mhour -= 12;
    mtime = mhour + mtime.substring(2) + " " + ampm;
      if(mhour < 10 && mhour>=0){
          mtime = "0" + mtime;
      }
  } else{
    mtime += " " + ampm;
  }
  return mtime;
}

function toMilitary(time){
  var hour = time.substring(0,2);
  var min = time.substring(3,5);
  var ampm = time.substring(6);
  if(hour == 12 && ampm == 'AM'){
    hour = '00'; 
  } else if(hour != 12 && ampm == 'PM'){
    hour = hour - 0 + 12;
  }
  var final_ = hour+":"+min;
  return final_;
}

function toMinutes(milli){
  return milli/60000;
}