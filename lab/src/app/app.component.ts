import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import $ from 'jquery';
import * as sha1 from 'js-sha1';
import {CacheService} from "../services/cache.service";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'lab';
  form!: FormGroup;
  salt: string;
  unauthorized = false;
  success = false;
  fromCache: any = '';

  constructor(private formBuilder: FormBuilder, private cacheService: CacheService, private http: HttpClient) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      login: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  async login() {
    this.unauthorized = false;
    this.success = false;
    // @ts-ignore
    this.getSalt().then((value) => {
      new Promise<boolean>((resolve, reject) => {
        this.salt = value;
        if (this.salt && this.salt !== '') {
          let passwordPlusSalt = sha1(sha1(this.form.get('password').value) + this.salt);
          let post = $.post({
            url: "http://localhost:8080/user/login", headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }, dateType: 'json', data: JSON.stringify({
              'username': this.form.get('login').value,
              'password': passwordPlusSalt
            }), error: function (jqXHR, textStatus, errorThrown) {
              console.log(textStatus);
              resolve(false)
            }
          })
          post.done(function (data) {
            resolve(data)
          })
        } else {
          resolve(false);
        }
      }).then((value) => {
        console.log(value);
        if (value) {
          this.success = true;
        } else {
          this.unauthorized = true;
        }
      })
    })
  }

  async getSalt(): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(this.form.get('login').value)
      let get = $.get({
        url: "http://localhost:8080/user/salt/" + this.form.get('login').value,
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(textStatus);
          reject();
        }
      });
      get.done(function (data) {
        resolve(data);
      });
    })
  }

  cacheTest() {
    let url = "http://localhost:8080/user/cache-test/1";
    new Promise<any>((resolve, reject) => {
      console.log(this.form.get('login').value)
      let get = $.get({
        url: url,
        error: function (jqXHR, textStatus, errorThrown) {
          console.log(textStatus);
          reject();
        }
      });
      get.done(function (data) {
        resolve(data);
      });
    }).then((value) => {
      this.fromCache = 'Obtained form request: ' + value;
    })
  }

  clearCache(): void {
    this.cacheService.clearCache();
  }

  sites: Site[] = [{site: 'www.wikipedia.pl', time: 0, weight: 0}, {site: 'www.trojmiasto.pl', time: 0, weight: 0}, {
    site: 'www.allegro.pl',
    time: 0, weight: 0
  }]

  public async webSwitching() {
    for (const site of this.sites) {
      await this.ping(site.site).then((res) => {
        site.time = res;
      })
    }
  }

  test() {
    let sum = 0;
    let weightSum = 0;
    this.sites.forEach((site) => {
      sum += site.time;
    })
    this.sites.forEach((site) => {
      site.weight = sum/site.time;
      weightSum += site.weight;
    })
    this.sites.sort(this.compareSites)
    console.log(this.sites);
    this.getSiteOnWeight(weightSum);
  }

  getSiteOnWeight(weightSum: number) {
    let min = Math.ceil(0);
    let max = Math.floor(weightSum);
    let res = Math.floor(Math.random() * (max - min)) + min;
    let chosenSite = null;
    console.log('rand: ' + res);
    this.sites.forEach((site) => {
      res -= site.weight;
      if (chosenSite === null && res <= 0) {
        chosenSite = site;
      }
    })

    console.log('Chosen site: ');
    console.log(chosenSite);
  }

  compareSites(s1: Site, s2: Site) {
    if (s1.weight > s2.weight) {
      return -1;
    }

    if (s1.weight < s2.weight) {
      return 1;
    }

    return 0;
  }

  ping(ip): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      let img = new Image();
      img.onload = function () {
      };
      img.onerror = function () {
      };

      let startTime = performance.now();
      img.src = "http://" + ip;
      resolve((performance.now() - startTime) / 1000);
    })
  }
}

export interface Site {
  site: string;
  time: number;
  weight: number;
}
