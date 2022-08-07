import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from "@angular/forms";

import { Workspace } from '../../interfaces/workspace';
import { User } from 'src/app/interfaces/user';

import { WorkspaceService } from '../../services/workspace.service';
import { UserService } from 'src/app/services/user.service';
import { AuthService } from '../../services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild("spaceDirective") spaceDirective!: NgForm;
  spaceform: FormGroup = this.createFormGroup();

  @ViewChild("userDirective") userDirective!: NgForm;
  userform: FormGroup = this.createUserForm();

  form: FormGroup = this.formBuilder.group({
    icon: new FormControl(''),
  })

  workspaces: Workspace[] = [];
  user!: User;

  title = 'NotesOn';
  logo = 'http://localhost:3000/static/images/notion-logo.png';
  month: string[] = [" ","January","February","March","April","May",
    "June","July","August","September","October","November","December"]
  
  constructor(
    private workspaceService: WorkspaceService,
    private authService: AuthService,
    private userService: UserService,
    private cookie: CookieService,
    private formBuilder: FormBuilder,
    private toastr: ToastrService, 
  ) { }

  ngOnInit(): void {
    this.spaceform = this.createFormGroup();
    this.userform = this.createUserForm();
    this.getWorkspaces();
    this.getUser();
  }

  getUser(): void {
    const authData = JSON.parse(this.cookie.get("authData") || '{}')
    this.userService.getUser(authData.userId)
      .subscribe(user => {
        this.user = user
      }); 
  }

  updateUser(formData: Partial<User>): void {
    if(!formData.userName) formData.userName = this.user.userName;
    if(!formData.firstName) formData.firstName = this.user.firstName;
    if(!formData.lastName) formData.lastName = this.user.lastName;
    if(!formData.oldpassword) formData.oldpassword = " ";
    if(!formData.password) delete formData["password"]; 
    
    const authData = JSON.parse(this.cookie.get("authData") || '{}')
    this.userService.patchUser(formData,authData.userId).subscribe((results)=> {
      this.userform.reset();
      this.getUser();

      if(results) this.toastr.success('User information updated.', '', {timeOut: 3000, positionClass: 'toast-bottom-right'})
      if(!results) this.toastr.error('Invalid Old Password!', '', {timeOut: 3000, positionClass: 'toast-bottom-right', })
    })
  }

  createUserForm(): FormGroup {
    // do not allow title containing only white spaces
    return new FormGroup({
      userName: new FormControl("", [Validators.maxLength(250)]),
      firstName: new FormControl("", [Validators.maxLength(250)]),
      lastName: new FormControl("", [Validators.maxLength(250)]),
      oldpassword: new FormControl("", [Validators.maxLength(250)]),
      password: new FormControl("", [Validators.maxLength(250)]),
    });
  }

  onIconSelect($event: Event): void {
    const file = ($event.target as HTMLInputElement).files![0];
    this.form.get('icon')!.patchValue( file );

    const allowedMimeTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"]
    if (file && allowedMimeTypes.includes(file.type)) {
      let formData = { "icon": this.form.get('icon')!.value };
      const authData = JSON.parse(this.cookie.get("authData") || '{}')
      this.userService.patchUserIcon(formData,authData.userId).subscribe(() => {
        this.getUser();
      });
    }
  }

  getWorkspaces(): void {
    const authData = JSON.parse(this.cookie.get("authData") || '{}')
    this.workspaceService.getUserSpaces(authData.userId)
      .subscribe(workspaces => this.workspaces = workspaces); 
  }

  createFormGroup(): FormGroup {
    // do not allow title containing only white spaces
    return new FormGroup({
      title: new FormControl("", [Validators.maxLength(60),Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]),
      description: new FormControl("", [Validators.maxLength(250)]),
    });
  }

  onSubmit(formData: Pick<Workspace, "title"|"description">): void {
    if(!formData.title) formData.title = "";
    if(!formData.description) formData.description = "";
    this.workspaceService.postWorkspace(formData).subscribe(()=> {
      this.spaceform.reset();
      this.spaceDirective.resetForm();
      this.getWorkspaces();
    })
  } 

  logout(): void {
    this.authService.logout();
  }

  formatDate(creationDate: string): string {
    let date = creationDate.split("T")[0].split("-");
    return `${this.month[parseInt(date[1])]} ${date[2]}, ${date[0]}`
  }

}
