export class Logger implements Disposable {
	constructor() {
		console.log("Cron job started at:", new Date().toISOString());
	}
	warn(message: string) {
		console.warn(message);
	}
	[Symbol.dispose](): void {
		console.log("Cron job finished at:", new Date().toISOString());
	}
}
