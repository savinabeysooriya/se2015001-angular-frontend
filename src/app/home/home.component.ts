import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { AdalService } from 'adal-angular4';
import {HttpClient, HttpErrorResponse, HttpEventType} from '@angular/common/http';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs';
import {HomeService} from './home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  isLoading: boolean = true;
  user: any;
  profile: any;
  displayedColumns: string[] = ['id', 'first_name', 'last_name', 'salary'];
  data = [];
  resources = null;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  files = [];
  constructor(private adalService: AdalService, protected http: HttpClient, protected homeService: HomeService) { }

  ngOnInit() {

    this.user = this.adalService.userInfo;

    this.user.token = this.user.token.substring(0, 10) + '...';
    this.loadEmployeeDetails();
  }

  getEmployeeDetails() {
    return this.http.get('https://se15001-nodejs-redis-app.azurewebsites.net/employee/get');
  }

  loadEmployeeDetails() {
    this.getEmployeeDetails().subscribe({
      next: result => {
        console.log(result);
        console.log(result['data']);
        this.data = result['data']['data'];
        this.resources = result['source'];
        this.isLoading = false;
      }
    });

  }

  uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file.data);
    file.inProgress = true;
    this.homeService.upload(formData).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            file.progress = Math.round(event.loaded * 100 / event.total);
            break;
          case HttpEventType.Response:
            return event;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        file.inProgress = false;
        return of(`${file.data.name} upload failed.`);
      })).subscribe((event: any) => {
      if (typeof (event) === 'object') {
        console.log(event.body);
      }
    });
  }
  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.files.forEach(file => {
      this.uploadFile(file);
    });
  }
  onClick() {
    const fileUpload = this.fileUpload.nativeElement;
    fileUpload.onchange = () => {
      for (let index = 0; index < fileUpload.files.length; index++)
      {
        const file = fileUpload.files[index];
        this.files.push({ data: file, inProgress: false, progress: 0});
      }
      this.uploadFiles();
    };
    fileUpload.click();
  }

  // public getProfile() {
  //   console.log('Get Profile called');
  //   return this.http.get('https://graph.microsoft.com/v1.0/me');
  // }
  //
  // public profileClicked() {
  //   this.getProfile().subscribe({
  //     next: result => {
  //       console.log('Profile Response Received');
  //       this.profile = result;
  //     }
  //   });
  // }
}
