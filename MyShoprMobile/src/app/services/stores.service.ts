import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable()
export class StoresService {
    private serverUrl = "https://myshopr-api.appspot.com";

    constructor(private http: HttpClient) { }

    getData() {
        let headers = this.createRequestHeader();
        const endpoint = "/stores"
        return this.http.get((this.serverUrl + endpoint), { headers: headers });
    }

    private createRequestHeader() {
        // set headers here e.g.
        let headers = new HttpHeaders({
            "Content-Type": "application/json",
         });

        return headers;
    }
}