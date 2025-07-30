import axios from "axios";
import CookieManage from "./CookieManage";

interface IUser {
  email: string;
  password: string;
}

class APIClient {
  private cookieManage: CookieManage;
  private domain: string;
  private loginEmail: string;
  private loginPassword: string;

  constructor() {
    this.cookieManage = new CookieManage();
    this.domain = process.env.DOMAIN || '';
    this.loginEmail = process.env.USERNAME || '';
    this.loginPassword = process.env.PASSWORD || '';
  }

  private async login(user: IUser) {
    const url = `${this.domain}/api/user/login`;
    const res = await axios.post(url, user);
    const cookies = res.headers["set-cookie"];
    this.cookieManage.save(cookies);
    return cookies;
  }

  private async getToken() {
    let requestCookies = this.cookieManage.serializer(["_yapi_token", "_yapi_uid"]);
    if (!requestCookies) {
      await this.login({ email: this.loginEmail, password: this.loginPassword });
      requestCookies = this.cookieManage.serializer(["_yapi_token", "_yapi_uid"]);
    }
    return requestCookies;
  }

  public async getAPIConfig(docUrl: string) {
    const token = await this.getToken();
    const requestUrl = `${this.domain}/api/interface/get?id=${this.getId(docUrl)}`;
    const { data } = await axios.get(requestUrl, {
      headers: {
        cookie: token,
      },
    });
    if (data.errcode) {
      // 如果token过期，清空cookie
      this.cookieManage.clearCookies();
      throw new Error(data.errmsg);
    }
    return data.data;
  }

  private getId(docUrl: string) {
    return docUrl.substring(docUrl.lastIndexOf("/") + 1, docUrl.length);
  }
}

export default APIClient;
