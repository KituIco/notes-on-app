import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup = this.createFormGroup();

  constructor(
    private authService: AuthService,
    private toastr: ToastrService, 
  ) { }

  ngOnInit(): void {
    this.signupForm = this.createFormGroup();
  }

  createFormGroup(): FormGroup {
    return new FormGroup({
      password: new FormControl("", [Validators.required, Validators.minLength(6), Validators.maxLength(60)]),
      userName: new FormControl("", [Validators.required, Validators.minLength(1), Validators.maxLength(30)]),
      firstName: new FormControl("", [Validators.required, Validators.minLength(1), Validators.maxLength(30)]),
      lastName: new FormControl("", [Validators.required, Validators.minLength(1), Validators.maxLength(30)]),
      email: new FormControl("", [Validators.required, Validators.email, Validators.maxLength(60), 
        Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]),
    });
  }

  signup(): void {
    this.authService.signup(this.signupForm.value).subscribe((results) => {
      if(results) this.toastr.success('Successfully Created User', '', {timeOut: 2000, positionClass: 'toast-bottom-right', })
      if(!results) this.toastr.error('Email Already in Use', '', {timeOut: 2000, positionClass: 'toast-bottom-right', })
    });
  }

  title = 'NotesOn';
  logo = 'http://localhost:3000/static/images/notion-logo.png';
}
