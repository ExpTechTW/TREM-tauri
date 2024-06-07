import type { AuthenticationDetail, EewType, PartialReport, Report, Rts, Station } from "@exptechtw/api-wrapper";
import { fetch, type ClientOptions } from "@tauri-apps/plugin-http";
import { Route } from "@/class/route";

export class ExpTechApi {
  token: string;
  route: Route;

  constructor(token?: string) {
    this.token = token || "";
    this.route = new Route();
  }

  setToken(token: string) {
    this.token = token;
  }

  /**
   * Inner get request wrapper
   * @param {string} url
   * @returns {Promise<any>}
   */
  async #get(url: string, options?: RequestInit & ClientOptions): Promise<any> {
    const res = await fetch(url, {
      keepalive: true,
      connectTimeout: 2000,
      ...options
    });

    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Server returned a status of ${res.status}`);
    }
  }

  /**
   * Inner post request wrapper
   * @param {string} url
   * @param {BodyInit} body
   * @returns {Promise<Response>}
   */
  async #post(url: string, body: BodyInit, options?: RequestInit & ClientOptions): Promise<Response> {
    const request = new Request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...options,
      body,
    });

    const res = await fetch(request);

    if (!res.ok) throw new Error(`Server returned ${res.status}`);

    return res;
  }

  async getStations(requestOptions?: RequestInit): Promise<Record<string, Station>> {
    return await this.#get(this.route.station, requestOptions);
  }

  async getReportList(limit?: number, requestOptions?: RequestInit): Promise<PartialReport[]> {
    const data = await this.#get(this.route.reportList(limit), requestOptions) as PartialReport[];

    for (const report of data) {
      report.no = +report.id.split("-")[0];
    }

    return data;
  }

  async getReport(id: string, requestOptions?: RequestInit): Promise<Report> {
    const data = await this.#get(this.route.report(id), requestOptions);

    data.no = +data.id.split("-")[0];
    data.int = Object.keys(data.list).reduce(
      (acc, key) => (data.list[key].int > acc ? data.list[key].int : acc),
      0
    );

    data.list = Object.keys(data.list)
      .map((key) => ({
        area: key,
        int: data.list[key].int,
        stations: Object.keys(data.list[key].town)
          .map((k) => ({
            ...data.list[key].town[k],
            station: k,
          }))
          .sort((a, b) => b.int - a.int),
      }))
      .sort((a, b) => b.int - a.int);

    return data;
  }

  async getRts(time?: number, requestOptions?: RequestInit): Promise<Rts> {
    return await this.#get(this.route.rts(time), requestOptions);
  }

  async getEew(time?: number, requestOptions?: RequestInit): Promise<EewType[]> {
    return await this.#get(this.route.eew(time), requestOptions);
  }

  async getAuthToken(options: AuthenticationDetail, route: (1 | 2) = 1, requestOptions?: RequestInit): Promise<string> {
    const url = this.route.login(route);
    const body = JSON.stringify({
      email: options.email,
      pass: options.password,
      name: options.name
    });
    console.log(body);

    return (await this.#post(url, body, requestOptions)).text();
  }
}