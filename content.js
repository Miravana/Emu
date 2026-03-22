const version = "1.0";

const storeMainNation = () => {
	let nation = localStorage.getItem('mainNation');

	while (!nation) {
		nation = prompt("Please enter your main nation:");
	}

	// Store it once they finally provide an input
	localStorage.setItem('mainNation', nation);
}

const createHiddenInput = (name, value) => {
	const input = document.createElement('input');
	input.type = 'hidden';
	input.name = name;
	input.value = value;
	return input;
};

const simultaneityLock = () => {
	document.querySelectorAll('input[type="submit"], button').forEach(el => {
		el.disabled = true;
		el.classList.add("disabledForSimultaneity");
	});
}

storeMainNation();
const userAgent = `Emu v${version} by miravana/sweeze in use by ${localStorage.getItem("mainNation")}`;

const buildURL = (url) => {
	const URLBuilder = new URL(url);
	URLBuilder.searchParams.append('script', userAgent);
	URLBuilder.searchParams.append('userclick', Date.now());
	return URLBuilder.toString();
}

const legalClick = (button) => {
	if (button.tagName === 'A') {
		button.href = buildURL(button.href);
		button.click();
		simultaneityLock();
		return;
	}
	// Generate the required hidden inputs
	const scriptInput = createHiddenInput('script', userAgent);
	const clickInput = createHiddenInput('userclick', Date.now());

	// Inject the inputs into the form
	const form = button.form;
	form.appendChild(scriptInput);
	form.appendChild(clickInput);

	// Trigger the form submission
	button.click();
	// lock all other buttons so you can't break simultaneity; page reloads after and buttons will be enabled by default on the new page, so no need to re-enable them in the code
	simultaneityLock()
};

const legalNavigate = (url) => {
	simultaneityLock();
	window.location.assign(buildURL(url));
}

document.addEventListener('keyup', function (event) { // keyup may seem less intuitive but it's already the standard in breeze-like scripts and it prevents holding down a key spamming the server
	if (event.shiftKey || event.ctrlKey || event.altKey || document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') { // locks you out of the script while you're holding down a modifier key or typing in an input
		return;
	} else {
		switch (event.code) { // event.code is the key that was pressed
			case 'KeyA': // reload page
				window.location.reload();
				break;
			case 'KeyQ': // go back
				window.history.back();
				break;
			case 'KeyU': // check if you updated
				legalNavigate("https://www.nationstates.net/page=activity/view=self/filter=change");
				break;
			case 'KeyS': // endorse nation
				if (window.location.href.includes("nation=")) {
					legalClick(document.getElementsByClassName('endorse button icon wa')[0]);
				}
				break;
			case 'KeyO': // ban nation
				if (window.location.href.includes("nation=")) {
					legalClick(document.getElementsByName('ban')[0]);
				}
				break;
			case 'KeyK': // eject nation
				if (window.location.href.includes("nation=")) {
					legalClick(document.getElementsByName('eject')[0]);
				}
				break;
			case 'KeyR': // confirm wa join
				if (window.location.href.includes("page=join_WA")) {
					legalClick(document.getElementsByClassName('button primary icon approve big')[0]);
				}
				break;
			case 'KeyF': // move to region whose page you're currently on
				if (window.location.href.includes("region=")) {
					legalClick(document.getElementsByName('move_region')[0]);
				}
				break;
			case 'KeyB': // move to House 
				if (window.location.href.includes("region=house_boucher")) {
					legalClick(document.getElementsByName('move_region')[0]);
				} else {
					legalNavigate("https://www.nationstates.net/region=house_boucher");
				}
				break;
			case 'KeyE': // apply/resign to WA
				if (window.location.href.includes("page=un")) {
					legalClick(document.getElementsByClassName('button icon')[1]);
				} else {
					legalNavigate("https://www.nationstates.net/page=un");
				}
				break;
			case 'KeyW': // go to current region page
				if (window.location.href.includes("page=change_region")) { // if on post-relocation page
					legalClick(document.querySelector('a.rlink')); // click the region link on the relocation page
				} else { // otherwise just click the region link through the sidebar
					legalClick(document.getElementById('panelregionbar').querySelector('a'));
				}
				break;
			case 'KeyD': // appoint yourself as and/or deappoint ROs
				var current_nation = document.getElementById("loggedin").getAttribute("data-nname");
				// If on the regional control page, open own regional officer page
				if (window.location.href.includes("page=region_control")) {
					legalNavigate("https://www.nationstates.net/page=regional_officer/nation=" + current_nation);
				}
				// If on on own regional officer page, assign officer role
				else if (window.location.href.includes("page=regional_officer/nation=" + current_nation)) {
					document.getElementsByName("office_name")[0].value = "Grow The Bush";
					document.getElementsByName("authority_A")[0].checked = true;
					document.getElementsByName("authority_C")[0].checked = true;
					document.getElementsByName("authority_E")[0].checked = true;
					document.getElementsByName("authority_P")[0].checked = true;
					legalClick(document.getElementsByName('editofficer')[0]);
				}
				// If on someone else's regional officer page, dismiss them
				else if (window.location.href.includes("regional_officer")) {
					legalClick(document.getElementsByName('abolishofficer')[0]);
				}
				// If on none of these pages, open regional control page
				else {
					legalNavigate("https://www.nationstates.net/page=region_control");
				}
				break;
		} // end switch
	} // end else
}); // end event listener