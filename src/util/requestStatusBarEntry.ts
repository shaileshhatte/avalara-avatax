import { StatusBarAlignment, StatusBarItem, window } from 'vscode';

export enum RequestState {
	Completed = 'Completed',
	Failed = 'Failed',
	Waiting = 'Waiting...',
	Error = 'Error'
}

export class RequestStatusEntry {
	static statusEntry: StatusBarItem;
	private status: RequestState;

	public constructor(status: RequestState) {
		if (RequestStatusEntry.statusEntry) {
			RequestStatusEntry.statusEntry.dispose();
		}
		RequestStatusEntry.statusEntry = window.createStatusBarItem(StatusBarAlignment.Left);
		this.status = status;
		this.update(this.status);
	}

	public dispose() {
		RequestStatusEntry.statusEntry.dispose();
	}

	public update(status: RequestState) {
		RequestStatusEntry.statusEntry.text = status.toString();
		RequestStatusEntry.statusEntry.tooltip = status.toString();
		RequestStatusEntry.statusEntry.show();
	}
}
