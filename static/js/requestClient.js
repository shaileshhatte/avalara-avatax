(function () {
    const vscode = acquireVsCodeApi();

    /***** Event listener to listen events coming from extension */
    window.addEventListener('message', (event) => {
        console.log(event);
        const message = event.data;

        switch (message.command) {
            case 'request_body_reset':
                console.log(message.reqBody);
                const resetRequestBody = message.reqBody || '';
                document.getElementById('request-body').value = resetRequestBody;
                showMessageToWindow('info', 'Request body reset.');
                break;

            default:
                break;
        }
    });

    function showMessageToWindow(variant, message) {
        if (variant && message) {
            const action = variant.toString().trim() === 'info' ? 'show_information_message' : 'show_error_message';
            vscode.postMessage({
                action: action,
                data: {
                    msg: message
                }
            });
        }
    }

    // *************** Description link show/hide behavior ************************ //

    let descShowLink = document.getElementById('description-show-link');
    if (descShowLink) {
        descShowLink.addEventListener('click', function (e) {
            e.preventDefault();
            let descriptionDiv = document.getElementById('description-div');
            if (descriptionDiv && descriptionDiv.style.display !== 'none') {
                descriptionDiv.style.display = 'none';
                e.target.innerHTML = 'Show Description';
            } else {
                descriptionDiv.style.display = 'inherit';
                e.target.innerHTML = 'Hide';
            }
        });
    }

    // **************** Model label link click handler ************************ //

    let modelLink = document.getElementById('model-link');
    if (modelLink) {
        modelLink.addEventListener('click', function (e) {
            e.preventDefault();
            const modelName = e.target.innerHTML || '';
            vscode.postMessage({
                action: 'launchmodel',
                data: {
                    model: modelName
                }
            });
        });
    }

    // **************** Copy label link click handler ************************ //

    let copyLink = document.getElementById('copy-body');
    if (copyLink) {
        copyLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Copy entered');
            const reqBodyElement = document.getElementById('request-body');
            let reqBody = '';
            if (!!reqBodyElement) {
                reqBody = reqBodyElement.value.trim();
                vscode.postMessage({
                    action: 'copy_request_body',
                    reqBody: reqBody
                });
            }
        });
    }

    // **************** Reset label link click handler ************************ //

    let resetLink = document.getElementById('reset-body');
    if (resetLink) {
        resetLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('reset entered');
            const reqBodyElement = document.getElementById('request-body');
            if (!!reqBodyElement) {
                let modelName = reqBodyElement.getAttribute('data-model') || '';
                let isModelArrayOfItems = reqBodyElement.getAttribute('data-isModelArrayOfItems');
                vscode.postMessage({
                    action: 'reset_request_body',
                    modelName: modelName,
                    isModelArrayOfItems: isModelArrayOfItems
                });
            }
        });
    }

    // **************** Prettify label link click handler ************************ //

    let prettifyLink = document.getElementById('prettify-body');
    if (prettifyLink) {
        prettifyLink.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('prettify entered');
            const reqBodyElement = document.getElementById('request-body');
            try {
                if (!!reqBodyElement) {
                    const reqBodyObj = JSON.parse(reqBodyElement.value.trim());
                    const formattedJson = JSON.stringify(reqBodyObj, null, 2);
                    reqBodyElement.value = formattedJson;
                    // showMessageToWindow('info', '')
                }
            } catch (error) {
                showMessageToWindow('error', 'Invalid request body.');
            }
        });
    }

    // **************** Send request click handler ************************ //

    const btnSend = document.getElementById('btn-send');
    // Send button click handler
    btnSend.addEventListener('click', (e) => {
        e.preventDefault();
        // Check all mandatory fields are filled in
        let requiredInputFields = document.getElementsByClassName('input-true');
        for (let i = 0; i < requiredInputFields.length; i++) {
            let ipField = requiredInputFields[i];
            if (!ipField.value.toString().trim()) {
                showMessageToWindow('error', 'Please fill all mandatory fields.');
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
        let headerValues = {};
        for (let i = 0; i < headerInputBoxes.length; i++) {
            let inputBox = headerInputBoxes[i];
            // let ho = {};
            let paramName = inputBox.getAttribute('data-paramname').trim();
            let paramValue = inputBox.value.trim() || '';

            if (paramValue === '') {
                continue;
            }

            headerValues[paramName] = paramValue;
        }

        // Collect query values
        let queryInputBoxes = document.getElementsByClassName('input-query');
        let queryValues = {};
        for (let j = 0; j < queryInputBoxes.length; j++) {
            let inputBox = queryInputBoxes[j];
            let ho = {};
            let paramName = inputBox.getAttribute('data-paramname').trim();
            let paramValue = inputBox.value.trim() || '';

            if (paramValue === '') {
                continue;
            }
            queryValues[paramName] = paramValue;
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
