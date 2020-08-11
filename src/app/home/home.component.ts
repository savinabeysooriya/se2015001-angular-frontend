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
        this.resources = 'Data getting from ' + result['source'];
        this.isLoading = false;
      }
    });

  }

  // uploadFile(file) {
  //   const formData = new FormData();
  //   formData.append('image', file.data);
  //   this.homeService.upload(formData).subscribe({
  //     next: result => {
  //       console.log(result);
  //       if (result['statusCode'] == 200) {
  //         this.resources = 'Image uploaded successfully'
  //       } else {
  //         this.resources = 'Image upload failed!'
  //       }
  //     }
  //   });
  // }
  //
  // private uploadFiles() {
  //   this.fileUpload.nativeElement.value = '';
  //   this.uploadFile(this.files[0]);
  //   }


  uploadFile(file) {
    const formData = new FormData();
    formData.append('image', file.data);
    // this.isLoading = true;
    this.homeService.upload(formData).subscribe({
      next: result => {
        // this.isLoading = false;
        if (result['statusCode'] == 200) {
          this.resources = 'Image uploaded successfully';
        } else {
          this.resources = 'Image upload failed!';
        }
      }
    });
  }
  private uploadFiles() {
    this.fileUpload.nativeElement.value = '';
    this.uploadFile(this.files[0]);
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
