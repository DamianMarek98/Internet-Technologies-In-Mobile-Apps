import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import $ from 'jquery';
import * as sha1 from 'js-sha1';
import {CacheService} from "../services/cache.service";


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

  constructor(private formBuilder: FormBuilder, private cacheService: CacheService) {
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
          let passwordPlusSalt = sha1(this.form.get('password').value) + this.salt;
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
    let url = "http://localhost:8080/user/cache-test";
    if (this.cacheService.recordExists(url)) {
      this.fromCache = 'Obtained form cache: ' + this.cacheService.get(url);
    } else {
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
        this.cacheService.set(url, value);
      })
    }
  }

  clearCache(): void {
    this.cacheService.clearCache();
  }

  public async webSwitching() {
    let sites: string[] = ['www.gdansk.pl', 'www.sopot.pl', 'www.gdynia.pl'];
    let times: number[] = [];
    for (const url of sites) {
      let startTime = performance.now();
      $.ajax({url: 'https://' + url,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,POST,PUT",
          "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, Authorization"
        },
        success: function (result) {
          times.push(performance.now() - startTime);
      },
        error: function(result){
          alert('timeout/error');
        }})
      console.log(times);
      console.log("Posortowano: " + times.sort(this.compareNumbers))
    }
  }

  compareNumbers(a, b) {
    return a - b
  }
}
