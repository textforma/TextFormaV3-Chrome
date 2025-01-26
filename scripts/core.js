function textforma(global) {
	global.length = 0;
	global.attrs = [ 'alt', 'title', 'summary', 'abbr', 'value' ];
	global.regex.input = new RegExp('^(range|color|file|image|checkbox|radio|password|hidden)$', 'i');
	global.port.postMessage({ 'type': 'observe', 'state': document.readyState, 'url': location.href });
	global.port.onMessage.addListener(function(message) {
		if (message.type == 'observe') {
			if (message.loop) {
				var text = getHtmlText(document.documentElement);
				if (text.length != global.length) {
					if (global.regex['search'].test(text)) {
						replaceText(document.documentElement);
					}
					if (global.regex['search'].test(getAttrText(document.documentElement))) {
						replaceAttr(document.documentElement);
					}
					if (global.length > 512 && document.documentElement.style.display == 'none') {
						document.documentElement.style.display = 'block';
					}
					global.length = text.length;
				}
				global.port.postMessage({ 'type': 'observe', 'state': document.readyState });
			} else {
				var observer = new MutationObserver(function(mutations) {
					for (var i = 0; i < mutations.length; i++) {
						switch (mutations[i].type) {
							case 'childList':
								for (var n = 0; n < mutations[i].addedNodes.length; n++) {
									if (global.regex['search'].test(getHtmlText(mutations[i].addedNodes[n]))) {
										replaceText(mutations[i].addedNodes[n]);
									}
								}
								break;
							case 'characterData':
								replaceText(mutations[i].target.parentNode || mutations[i].target);
								break;
							case 'attributes':
								replaceAttr(mutations[i].target.parentNode);
								break;
							default:
								console.log('type:' + mutations[i].type);
								break;
						}
					}
				});
				observer.observe(document, {
					attributes: true, childList: true, characterData: true, subtree: false, subtree: true, attributeFilter: global.attrs
				});

				if (global.regex['search'].test(getHtmlText(document.documentElement))) {
					replaceText(document.documentElement);
				}
				if (global.regex['search'].test(getAttrText(document.documentElement))) {
					replaceAttr(document.documentElement);
				}
				document.documentElement.style.display = 'block';
				if (document.body.dataset.allowTextForma == 'false') {
					global.port.postMessage({ 'type': 'deny', 'url': location.href, 'title': document.title });
				}
			}
		}
	});

	function replaceText(element) {
		if (element.childNodes.length > 0) {
			for (var i = 0; i < element.childNodes.length; i++)  {
				if (!/^(script|style)$/i.test(element.childNodes[i].tagName)) {
					replaceText(element.childNodes[i]);
				}
			}
		}
		if (element.nodeType == Node.TEXT_NODE && element.nodeValue.trim() != '') {
			if (global.regex['search'].test(element.nodeValue)) {
				if (global.regex['conceal'] != null && global.regex['conceal'].test(element.nodeValue)) {
					element.nodeValue = '* '.repeat(1 + element.nodeValue.trim().length / 2 | 0);
				} else if (global.regex['replace'] != null && global.regex['replace'].test(element.nodeValue)) {
					for (var i = 0; i < global.replacements.length; i++) {
						if (global.replacements[i]['regex'].test(element.nodeValue)) {
							if (global.replacements[i]['replacement'] != '_*_') {
								element.nodeValue = element.nodeValue.replace(global.replacements[i]['regex'], global.replacements[i]['replacement']);
							} else {
								element.nodeValue = element.nodeValue.replace(global.replacements[i]['regex'], '*'.repeat(global.replacements[i]['regex'].toString().length - 4));
							}
						}
					}
				}
			}
		} else if (element.nodeType == Node.CDATA_SECTION_NODE) {
			if (global.regex['search'].test(element.data)) {
				if (global.regex['conceal'] != null && global.regex['conceal'].test(element.data)) {
					element.data = '* '.repeat(1 + element.data.trim().length / 2 | 0);
				} else if (global.regex['replace'] != null && global.regex['replace'].test(element.data)) {
					for (var i = 0; i < global.replacements.length; i++) {
						if (global.replacements[i]['regex'].test(element.data)) {
							if (global.replacements[i]['replacement'] != '_*_') {
								element.data = element.data.replace(global.replacements[i]['regex'], global.replacements[i]['replacement']);
							} else {
								element.data = element.data.replace(global.replacements[i]['regex'], '*'.repeat(global.replacements[i]['regex'].toString().length - 4));
							}
						}
					}
				}
			}
		} else if (element.nodeType == Node.ELEMENT_NODE) {
			if (global.pseudo) {
				try {
					var before = getComputedStyle(element, '::before').getPropertyValue('content');
					var after = getComputedStyle(element, '::after').getPropertyValue('content');
					if (before != 'none' && global.regex['search'].test(before)) {
						replacePseudo(element, before, 'before');
					}
					if (after != 'none' && global.regex['search'].test(after)) {
						replacePseudo(element, after, 'after');
					}
				} catch(e) {}
			}
		}
	}

	function replacePseudo(element, content, which) {
		var uid = 'pseudo-xxxxxxxx'.replace(/x/g, function(c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
		document.styleSheets[0].insertRule('.' + uid + '::' + which + ' { content: "' + '* '.repeat(1 + content.length / 2 | 0) + '" !important }', 0);
		element.classList.add(uid);
	}

	function replaceAttr(element) {
		var elements = getAttrElements(element);
		for (var i = 0; i < elements.length; i++) {
			if (elements[i]['nodes'].length > 0) {
				var attribute = elements[i]['attribute'];
				for (var n = 0; n < elements[i]['nodes'].length; n++) {
					var element = elements[i]['nodes'][n];
					var value = element.getAttribute(attribute);
					if (global.regex['search'].test(value)) {
						if (global.regex['conceal'] != null && global.regex['conceal'].test(value)) {
							element.setAttribute(attribute, '* '.repeat(value.trim().length));
						} else if (global.regex['replace'] != null && global.regex['replace'].test(value)) {
							for (var d = 0; d < global.replacements.length; d++) {
								if (global.replacements[d]['regex'].test(value)) {
									if (global.replacements[d]['replacement'] != '_*_') {
										element.setAttribute(attribute, value.replace(global.replacements[d]['regex'], global.replacements[d]['replacement']));
									} else {
										element.setAttribute(attribute, value.replace(global.replacements[d]['regex'], '*'.repeat(global.replacements[d]['regex'].toString().length - 4)));
									}
								}
							}
						}
					}
				}
			}
		}
	}

	function getHtmlText(element) {
		var clone = element.cloneNode(true);
		try {
			var scripts = clone.getElementsByTagName('script');
			var styles = clone.getElementsByTagName('style');
			for (var i = 0; i < scripts.length; i++) {
				scripts[i].parentNode.removeChild(scripts[i]);
			}
			for (var i = 0; i < styles.length; i++) {
				styles[i].parentNode.removeChild(styles[i]);
			}
		} catch(e) {}
		finally {
			return clone.textContent.replace(/\s+/g, ' ');
		}
	}

	function getAttrText(element) {
		var elements = getAttrElements(element), buffer = '';
		for (var i = 0; i < elements.length; i++) {
			if (elements[i]['nodes'].length > 0) {
				var attribute = elements[i]['attribute'];
				for (var n = 0; n < elements[i]['nodes'].length; n++) {
					buffer += '<>' + elements[i]['nodes'][n].getAttribute(attribute);
				}
			}
		}
		return buffer;
	}

	function getAttrElements(element) {
		var elements = [];
		for (var i = 0; i < global.attrs.length; i++) {
			if (global.attrs[i] == 'value') {
				var nodes = [], values = element.querySelectorAll('input[value], datalist option[value]');
				for (var n = 0; n < values.length; n++) {
					if ((/input/i.test(values[n].tagName) && !global.regex.input.test(values[n].type)) || /option/i.test(values[n].tagName)) {
						nodes.push(values[n]);
					}
				}
				elements.push({ 'attribute': 'value', 'nodes': nodes });
			} else {
				elements.push({ 'attribute': global.attrs[i], 'nodes': element.querySelectorAll('[' + global.attrs[i] + ']') });
			}
		}
		return elements;
	}

	if (global.textbox) {
		setInterval(function() {
			replaceForm(document.getElementsByTagName('input'));
			replaceForm(document.getElementsByTagName('textarea'));		
		}, 100);
	}

	function replaceForm(elements) {
		for (var i = 0; i < elements.length; i++) {
			if (elements[i].hasAttribute('type')) {
				if (!/^(text|search|button)$/.test(elements[i].getAttribute('type'))) {
					continue;
				}
			}
			if (global.regex['search'].test(elements[i].value)) {
				if (global.regex['conceal'] != null && global.regex['conceal'].test(elements[i].value)) {
					elements[i].value = '* '.repeat(elements[i].value.trim().length);
				} else if (global.regex['replace'] != null && global.regex['replace'].test(elements[i].value)) {
					for (var d = 0; d < global.replacements.length; d++) {
						if (global.replacements[d]['regex'].test(elements[i].value)) {
							if (global.replacements[d]['replacement'] != '_*_') {
								elements[i].value = elements[i].value.replace(global.replacements[d]['regex'], global.replacements[d]['replacement']);
							} else {
								elements[i].value = elements[i].value.replace(global.replacements[d]['regex'], '*'.repeat(global.replacements[d]['regex'].toString().length - 4));
							}
						}
					}
				}
			}
		}
	}
}
