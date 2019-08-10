var htmlf = ["checklist2", "alarm", "saved"];

//Makes the popup page accordingly to the href stored in the button
$('[id^="a"]').click(function(){
	var num = this.id.substring(1);
	var page = 'html/' + htmlf[num] + '.html';
	chrome.browserAction.setPopup({popup: page});
	page = '../'+page;
	window.location.href=page;
});