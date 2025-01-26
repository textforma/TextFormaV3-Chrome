$(document).ready(function() {
	$('.translation').each(function() {
		$(this).text((chrome.i18n.getMessage($(this).text())));
	});
	$('#add-words').css('display', 'block');
	$('#edit-words').css('display', 'none');
	chrome.storage.local.get(function(result) {
		$('#edit-words textarea').val(result['textarea'] || '');
	});
	$('#header a').on('click', function(e) {
		var url = 'http://txtforma.s1007.xrea.com/';
		if (e.which == 1) {
			chrome.tabs.update({ 'url': url });
			window.close();
		} else if (e.which == 2) {
			chrome.tabs.create({ 'url': url });
		}
	});
	$('.toggle > span').on('click', function() {
		$('#edit-words').slideToggle();
		$('#add-words').slideToggle();
	});
	$('button').on('click', function() {
		if ($('#add-words').css('display') == 'block') {
			setStorage($('#edit-words textarea').val() + '\r\n' + $('#add-words textarea').val());
		} else {
			setStorage($('#edit-words textarea').val());
		}
	});
	$('#error .back').on('click', function() {
		$('#error').css('display', 'none');
	});
});

function setStorage(textarea) {
	var conceals = [], replaces = [], replacements = {}, dataset = { 'conceal': {}, 'replace': {} }, error = null;
	var lines = textarea.split(/\r\n|\r|\n/).filter(function(line) { return line.trim().length > 0 });
	lines = lines.filter(function(value, index, self) { return self.indexOf(value) === index });
	if (lines.length == 0) {
		chrome.storage.local.remove([ 'search', 'conceal', 'replace', 'replacements', 'textarea' ], function() {
			chrome.tabs.query({}, function(tabs) {
				tabs.forEach(function (tab) {
					chrome.tabs.reload(tab.id);
				});
			});
			window.close();
		});
		return;
	}
	for (var i = 0; i < lines.length; i++) {
		var search, replacement = null;
		if (lines[i].indexOf('<>') >= 0) {
			var parts = lines[i].split('<>');
			search = parts[0];
			replacement = parts[1];
		} else {
			search = lines[i];
		}
		if (search.length == 0) {
			error = { 'type': 'empty', 'data': lines[i] };
			break;
		}
		if (/^<.*>$/.test(search)) {
			search = search.replace(/^<|>$/g, '');
			if (/^\{.*\}$/.test(search)) {
				search = search.replace(/^\{|\}$/g, '');
			} else {
				search = RegExp.escape(search);
			}
			replacement = '_*_';
		} else if (/^{.*}$/.test(search)) {
			search = search.replace(/^{|}$/g, '');
		} else {
			search = RegExp.escape(search);
		}
		try { new RegExp(search); } catch (e) {
			error = { 'type': 'regex', 'data': lines[i] };
			break;
		}
		if (replacement != null) {
			replaces.push(search);
			replacements[search] = replacement;
			dataset['replace'][lines[i]] = { 'search': search, 'replacement': replacement };
		} else {
			conceals.push(search);
			dataset['conceal'][lines[i]] = { 'search': search };
		}
	}
	if (error != null) {
		var ul = document.createElement('ul');
		var li = document.createElement('li');
		li.appendChild(document.createTextNode(error['data']));
		ul.appendChild(li);
		$('.empty, .regex, .infinite').css('display', 'none');
		$('#error .' + error['type']).css('display', 'block');
		var data = document.querySelector('#error .data');
		data.removeChild(data.firstChild);
		data.appendChild(ul);
		$('#error').css('display', 'block');
		return;
	}
	var counter = {};
	Object.keys(dataset['conceal']).forEach(function(line) {
		if (/^[\* ]+$/.test(line)) {
			counter[line] = 100;
		}
	});
	var subject = Object.keys(replacements).map(function(key) { return replacements[key] }).join('<>');
	for (var i = 0; i < 100; i++) {
		Object.keys(dataset['replace']).forEach(function(line) {
			if ((new RegExp(dataset['replace'][line]['search'], 'i')).test(subject)) {
				subject = subject.replace(new RegExp(dataset['replace'][line]['search'], 'i'), dataset['replace'][line]['replacement']);
				counter[line] = counter[line] !== undefined ? counter[line] + 1 : 1;
			}
		});
	}
	var ul = document.createElement('ul');
	Object.keys(counter).forEach(function(key) {
		if (counter[key] > 10) {
			var li = document.createElement('li');
			li.appendChild(document.createTextNode(key));
			ul.appendChild(li);
		}
	});
	if (ul.childNodes.length > 0) {
		$('.empty, .regex, .infinite').css('display', 'none');
		$('.infinite').css('display', 'block');
		var data = document.querySelector('#error .data');
		data.removeChild(data.firstChild);
		data.appendChild(ul);
		$('#error').css('display', 'block');
		return;
	}
	var storage = {};
	storage['search'] = conceals.concat(replaces).join('|');
	storage['conceal'] = conceals.join('|');
	storage['replace'] = replaces.join('|');
	storage['replacements'] = JSON.stringify(replacements);
	chrome.storage.local.set({ 'search':  storage['search'] });
	chrome.storage.local.set({ 'conceal': storage['conceal'] });
	chrome.storage.local.set({ 'replace': storage['replace'] });
	chrome.storage.local.set({ 'replacements': storage['replacements'] });
	chrome.storage.local.set({ 'textarea': lines.join('\r\n') });
	chrome.tabs.query({}, function(tabs) {
		tabs.forEach(function (tab) {
			chrome.tabs.reload(tab.id);
		});
		window.close();
	});	
 }

RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


