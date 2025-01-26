$(document).ready(function() {
	var elements = document.getElementsByClassName('translation');
	$('.translation').each(function() {
		$(this).text((chrome.i18n.getMessage($(this).text())));
	});
	chrome.storage.local.get(function(result) {
		var pseudo = result['pseudo'] !== undefined ? result['pseudo'] : false;
		var textbox = result['textbox'] !== undefined ? result['textbox'] : true;
		$('input[name="pseudo"]').attr('checked', pseudo);
		$('input[name=textbox]').attr('checked', textbox);
	});
	$(':checkbox').on('change', function() {
		chrome.storage.local.set({ [$(this).attr('name')]: $(this).is(':checked') });
	});
});
