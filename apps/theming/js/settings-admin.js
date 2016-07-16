/**
 * @author Björn Schießle <bjoern@schiessle.org>
 *
 * @copyright Copyright (c) 2016, Bjoern Schiessle
 * @license AGPL-3.0
 *
 * This code is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your opinion) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 *
 */

function setThemingValue(setting, value) {
	OC.msg.startSaving('#theming_settings_msg');
	$.post(
		OC.generateUrl('/apps/theming/ajax/updateStylesheet'), {'setting' : setting, 'value' : value}
	).done(function(response) {
		OC.msg.finishedSaving('#theming_settings_msg', response);
	}).fail(function(response) {
		OC.msg.finishedSaving('#theming_settings_msg', response);
	});
	preview(setting, value);
}

function calculateLuminance(rgb) {
	var hexValue = rgb.replace(/[^0-9A-Fa-f]/, '');
	var r,g,b;
	if (hexValue.length === 3) {
		hexValue = hexValue[0] + hexValue[0] + hexValue[1] + hexValue[1] + hexValue[2] + hexValue[2];
	}
	if (hexValue.length !== 6) {
		return 0;
	}
	r = parseInt(hexValue.substring(0,2), 16);
	g = parseInt(hexValue.substring(2,4), 16);
	b = parseInt(hexValue.substring(4,6), 16);
	return (0.299*r + 0.587*g + 0.114*b)/255;
}

function preview(setting, value) {
	if (setting === 'color') {
		var headerClass = document.getElementById('header');
		var expandDisplayNameClass = document.getElementById('expandDisplayName');
		var headerAppName = headerClass.getElementsByClassName('header-appname')[0];
		var textColor, icon;

		if (calculateLuminance(value) > 0.5) {
			textColor = "#000000";
			icon = 'caret-dark';
		} else {
			textColor = "#ffffff";
			icon = 'caret';
		}

		headerClass.style.background = value;
		headerClass.style.backgroundImage = '../img/logo-icon.svg';
		expandDisplayNameClass.style.color = textColor;
		headerAppName.style.color = textColor;

		$(headerClass).find('.icon-caret').each(function() {
			$(this).css('background-image', "url('" + OC.getRootPath() + '/core/img/actions/' + icon + ".svg')");
		});
	}
	if (setting === 'logoMime') {
		console.log(setting);
		var logos = document.getElementsByClassName('logo-icon');
		var timestamp = new Date().getTime();
		if (value !== '') {
			logos[0].style.background = "url('" + OC.generateUrl('/apps/theming/logo') + "?v" + timestamp + "')";
			logos[0].style.backgroundSize = "62px 34px";
		} else {
			logos[0].style.background = "url('" + OC.getRootPath() + '/core/img/logo-icon.svg?v' + timestamp +"')";
			logos[0].style.backgroundSize = "62px 34px";
		}
	}
}

$(document).ready(function () {
	$('#theming [data-toggle="tooltip"]').tooltip();

	var uploadParamsLogo = {
		pasteZone: null,
		dropZone: null,
		done: function (e, response) {
			preview('logoMime', response.result.data.name);
			OC.msg.finishedSaving('#theming_settings_msg', response.result);
		},
		submit: function(e, response) {
			OC.msg.startSaving('#theming_settings_msg');
		},
		fail: function (e, data){
			OC.msg.finishedSaving('#theming_settings_msg', response);
		}
	};
	var uploadParamsLogin = {
		pasteZone: null,
		dropZone: null,
		done: function (e, response) {
			preview('backgroundMime', response.result.data.name);
			OC.msg.finishedSaving('#theming_settings_msg', response.result);
		},
		submit: function(e, response) {
			OC.msg.startSaving('#theming_settings_msg');
		},
		fail: function (e, data){
			OC.msg.finishedSaving('#theming_settings_msg', response);
		}
	};

	$('#uploadlogo').fileupload(uploadParamsLogo);
	$('#upload-login-background').fileupload(uploadParamsLogin);

	$('#theming-name').change(function(e) {
		var el = $(this);
		$.when(el.focusout()).then(function() {
			setThemingValue('name', $(this).val());
		});
		if (e.keyCode == 13) {
			setThemingValue('name', $(this).val());
		}
	});

	$('#theming-url').change(function(e) {
		var el = $(this);
		$.when(el.focusout()).then(function() {
			setThemingValue('url', $(this).val());
		});
		if (e.keyCode == 13) {
			setThemingValue('url', $(this).val());
		}
	});

	$('#theming-slogan').change(function(e) {
		var el = $(this);
		$.when(el.focusout()).then(function() {
			setThemingValue('slogan', $(this).val());
		});
		if (e.keyCode == 13) {
			setThemingValue('slogan', $(this).val());
		}
	});

	$('#theming-color').change(function (e) {
		setThemingValue('color', '#' + $(this).val());
	});

	$('.theme-undo').click(function (e) {
		var setting = $(this).data('setting');
		OC.msg.startSaving('#theming_settings_msg');
		$.post(
			OC.generateUrl('/apps/theming/ajax/undoChanges'), {'setting' : setting}
		).done(function(response) {
			if (setting === 'color') {
				var colorPicker = document.getElementById('theming-color');
				colorPicker.style.backgroundColor = response.data.value;
				colorPicker.value = response.data.value.slice(1);
			} else if (setting !== 'logoMime' && setting !== 'backgroundMime') {
				var input = document.getElementById('theming-'+setting);
				input.value = response.data.value;
			}
			preview(setting, response.data.value);
			OC.msg.finishedSaving('#theming_settings_msg', response);
		});
	});
});
