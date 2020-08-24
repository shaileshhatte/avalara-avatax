(function () {
	const vscode = acquireVsCodeApi();

	const btnCopy = document.getElementById('btn-copy');
	if (btnCopy) {
		btnCopy.addEventListener('click', (e) => {
			console.log('Hello');
			vscode.postMessage({
				action: 'copy',
				data: {}
			});
		});
	}

	const btnSave = document.getElementById('btn-save');
	if (btnSave) {
		btnSave.addEventListener('click', (e) => {
			vscode.postMessage({
				action: 'save',
				data: {}
			});
		});
	}

	const btnGenerateSnippet = document.getElementById('btn-generate-code-snippet');
	if (btnGenerateSnippet) {
		btnGenerateSnippet.addEventListener('click', function (e) {
			vscode.postMessage({
				action: 'generatecodesnippet',
				data: {}
			});
		});
	}
})();
