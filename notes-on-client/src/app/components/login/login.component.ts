import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = this.createFormGroup();

  constructor(
    private authService: AuthService,
    private toastr: ToastrService,   
  ) {}

  ngOnInit(): void {
    this.loginForm = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      password: new FormControl("", [Validators.required, Validators.minLength(7), Validators.maxLength(60),]),
      email: new FormControl("", [Validators.required, Validators.email, Validators.maxLength(60), 
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    });
  }

  login(): void {
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe((results) => {
        if(results) this.toastr.success('Successfully Logged In', '', {timeOut: 2000, positionClass: 'toast-bottom-right', })
        if(!results) this.toastr.error('Invalid Email or Password', '', {timeOut: 2000, positionClass: 'toast-bottom-right', })
      });
  }

  title = 'NotesOn';
  logo = 'http://localhost:3000/static/images/notion-logo.png';
}
