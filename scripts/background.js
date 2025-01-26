chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(message) {
		chrome.storage.local.get(function(result) {
			var _localStorage = {};
			_localStorage['search'] = result['search'] !== undefined ? result['search'] : '';
			_localStorage['conceal'] = result['conceal'] !== undefined ? result['conceal'] : '';
			_localStorage['replace'] = result['replace'] !== undefined ? result['replace'] : '';
			_localStorage['replacements'] = result['replacements'] !== undefined ? result['replacements'] : '';
			_localStorage['pseudo'] = result['pseudo'] !== undefined ? result['pseudo'] : false;
			_localStorage['textbox'] = result['textbox'] !== undefined ? result['textbox'] : true;
			if (message.type == 'observe') {
				if (/^loading$/i.test(message.state)) {
					port.postMessage({ 'type': 'observe', 'loop': true });
				} else {
					port.postMessage({ 'type': 'observe', 'loop': false });
				}
			} else if (message.type == 'storage') {
				if (_localStorage['search'].length > 0) {					
					port.postMessage({ 'type': 'storage', 'loop': false, 'storage': _localStorage });
				} else {
					port.postMessage({ 'type': 'storage', 'loop': true });
				}
			} else if (message.type == 'deny') {
				chrome.tabs.query({ 'url': message.url }, function(tabs) {
					if (tabs.length > 0) {
						tabs.forEach(function(tab) {
							chrome.tabs.update(tab.id, { 'url': chrome.runtime.getURL('/html/denied.html') + '?url=' + encodeURIComponent(message.url) + '&title=' + encodeURIComponent(message.title) + '&search=' + encodeURIComponent(_localStorage['search']) });
						});
					} else {
						chrome.tabs.update(tab.id, { 'url': chrome.runtime.getURL('/html/denied.html') + '?url=' + encodeURIComponent(message.url) + '&title=' + encodeURIComponent(message.title) + '&search=' + encodeURIComponent(_localStorage['search']) });
					}
				});
			}
		});
	});
});

function getLocale() {
	var locale = chrome.i18n.getMessage('@@ui_locale');
	return /^(ja)$/i.test(locale) ? locale : 'ja'; // __LOCALE_BACKGROUND__
}
