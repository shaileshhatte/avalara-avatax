(function () {
	const vscode = acquireVsCodeApi();

	// *************** Description show/hide behavior ************************ //

	let descShowLink = document.getElementById('description-show-link');
	if (descShowLink) {
		console.log('Inside 1');
		descShowLink.addEventListener('click', function (e) {
			console.log('Inside 2');
			let descriptionDiv = document.getElementById('description-div');
			if (descriptionDiv && descriptionDiv.style.display !== 'none') {
				console.log('Inside 3');
				descriptionDiv.style.display = 'none';
				e.target.innerHTML = 'Show Description';
			} else {
				console.log('Inside 4');
				descriptionDiv.style.display = 'inherit';
				e.target.innerHTML = 'Hide';
			}
		});
	}

	// **************** Model label link click handler ************************ //

	let modelLink = document.getElementById('model-link');
	if (modelLink) {
		modelLink.addEventListener('click', function (e) {
			console.log(e.target.innerHTML || '');
			const modelName = e.target.innerHTML || '';
			vscode.postMessage({
				action: 'launchmodel',
				data: {
					model: modelName
				}
			});
		});
	}

	// **************** Model label link click handler ************************ //

	const btnSend = document.getElementById('btn-send');
	// Send button click handler
	btnSend.addEventListener('click', (e) => {
		// Check all mandatory fields are filled in

		let requiredInputFields = document.getElementsByClassName('input-true');
		for (let i = 0; i < requiredInputFields.length; i++) {
			let ipField = requiredInputFields[i];
			if (!ipField.value.toString().trim()) {
				vscode.postMessage({
					action: 'requiredfields'
				});

				return;
			}
		}

		// Gather all data
		let endpointMethod = '';
		let endpointUrl = '';
		const mainDiv = document.getElementById('main');
		if (!!mainDiv) {
			endpointMethod = mainDiv.getAttribute('data-method');
			endpointUrl = mainDiv.getAttribute('data-url');
		}

		const reqBodyElement = document.getElementById('request-body');
		let reqModel = '';
		let reqBody = '';
		if (!!reqBodyElement) {
			reqBody = reqBodyElement.value;
			reqModel = reqBodyElement.getAttribute('data-model');
		}

		// Collect path values
		let pathInputBoxes = document.getElementsByClassName('input-path');
		let pathValues = [];

		for (let i = 0; i < pathInputBoxes.length; i++) {
			let inputBox = pathInputBoxes[i];
			let ho = {};
			let paramName = inputBox.getAttribute('data-paramname').trim();
			let paramValue = inputBox.value.trim() || '';
			ho[paramName] = paramValue;
			pathValues.push(ho);
		}

		// Collect header values
		let headerInputBoxes = document.getElementsByClassName('input-header');
		let headerValues = [];

		for (let i = 0; i < headerInputBoxes.length; i++) {
			let inputBox = headerInputBoxes[i];
			let ho = {};
			let paramName = inputBox.getAttribute('data-paramname').trim();
			let paramValue = inputBox.value.trim() || '';
			ho[paramName] = paramValue;
			headerValues.push(ho);
		}

		// Collect query values
		let queryInputBoxes = document.getElementsByClassName('input-query');
		let queryValues = [];

		for (let j = 0; j < queryInputBoxes.length; j++) {
			let inputBox = queryInputBoxes[j];
			let ho = {};
			let paramName = inputBox.getAttribute('data-paramname').trim();
			let paramValue = inputBox.value.trim() || '';
			ho[paramName] = paramValue;
			queryValues.push(ho);
		}

		vscode.postMessage({
			action: 'send',
			data: {
				reqbody: reqBody || 'NA',
				url: endpointUrl,
				method: endpointMethod,
				model: reqModel || '',
				parameters: {
					headervalues: headerValues,
					queryvalues: queryValues,
					pathvalues: pathValues
				}
			}
		});
	});
})();
