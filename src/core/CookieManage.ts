import * as cookieTools from "cookie";

interface ICookie {
  [key: string]: string;
}

export default class CookieManage {
  private cookies: ICookie = {};

  constructor() {
    // The constructor can be left empty or used for other initializations.
  }

  save(cookies: string[] | undefined) {
    if (cookies) {
      // Merge new cookies into the existing ones.
      // Using Object.assign to merge all cookie objects into one.
      const newCookies = cookies.map((c) => cookieTools.parse(c));
      Object.assign(this.cookies, ...newCookies);
    }
  }

  clearCookies() {
    this.cookies = {};
  }

  serializer(keys?: string[]) {
    const targetKeys = keys || Object.keys(this.cookies);
    if (targetKeys.length === 0) {
      return "";
    }

    const values = targetKeys
      .map((key) => {
        // Ensure that we don't serialize undefined/null values if key doesn't exist
        if (this.cookies[key]) {
          return `${key}=${this.cookies[key]}`;
        }
        return null;
      })
      .filter((value): value is string => value !== null); // filter out null values

    return values.join("; ");
  }

  getCookie(key: string): string | undefined {
    return this.cookies[key];
  }
}
