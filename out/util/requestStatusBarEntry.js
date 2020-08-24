"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestStatusEntry = exports.RequestState = void 0;
const vscode_1 = require("vscode");
var RequestState;
(function (RequestState) {
    RequestState["Completed"] = "Completed";
    RequestState["Failed"] = "Failed";
    RequestState["Waiting"] = "Waiting...";
    RequestState["Error"] = "Error";
})(RequestState = exports.RequestState || (exports.RequestState = {}));
class RequestStatusEntry {
    constructor(status) {
        if (RequestStatusEntry.statusEntry) {
            RequestStatusEntry.statusEntry.dispose();
        }
        RequestStatusEntry.statusEntry = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this.status = status;
        this.update(this.status);
    }
    dispose() {
        RequestStatusEntry.statusEntry.dispose();
    }
    update(status) {
        RequestStatusEntry.statusEntry.text = status.toString();
        RequestStatusEntry.statusEntry.tooltip = status.toString();
        RequestStatusEntry.statusEntry.show();
    }
}
exports.RequestStatusEntry = RequestStatusEntry;
//# sourceMappingURL=requestStatusBarEntry.js.map