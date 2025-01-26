$(document).ready(function() {
	$('.translation').each(function() {
		$(this).text(chrome.i18n.getMessage($(this).text()));
	});
	var url = decodeURIComponent(location.search.replace(/^.*[\?&]url=([^&$]*).*$/, '$1')).replace(/<.*?>/g, '');
	var title = decodeURIComponent(location.search.replace(/^.*[\?&]title=([^&$]*).*$/, '$1')).replace(/<.*?>/g, '');
	var search = decodeURIComponent(location.search.replace(/^.*[\?&]search=([^&$]*).*$/, '$1'));
	$('#compromise > a').attr('href', url);
	$('#title').text(title);
	$('#url').text(url);
	if (search.length > 0) {
		if (new RegExp(search, 'i').test(url)) {
			$('#url').text(new Array((url.length / 2) | 0).join('* '));
		}
	}
/*
	$('#compromise > a').on('click', function() {
		if (confirm($('#confirm-message').text())) {
			var url = $(this).attr('href');
			chrome.tabs.update({ 'url': url });
		}
		return false;
	});
*/
});
