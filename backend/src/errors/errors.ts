export class MyError extends Error {
	constructor(message: string) {
	  super("ERROR: " + message);
	  Object.setPrototypeOf(this, MyError.prototype)
	}
  }