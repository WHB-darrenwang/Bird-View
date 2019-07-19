//Makes the popup page accordingly to the href stored in the button
$('[id^="a"]').click(function(){
	var page = 'html/' + $(this).attr('href');
	chrome.browserAction.setPopup({popup: page});
});