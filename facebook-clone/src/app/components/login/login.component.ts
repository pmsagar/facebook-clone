import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  subs: Subscription[] = [];
  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private matDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.subs.push(
      this.authService.UserData.subscribe((user) => {
        if (user) {
          this.router.navigateByUrl('/').then();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.map((sub) => sub.unsubscribe());
  }

  login(form: NgForm) {
    const { email, password } = form.value;
    if (!form.valid) {
      return;
    }
    this.authService.SignIn(email, password);
    form.resetForm();
  }
  openRegister(): void {
    const dialogRef = this.matDialog.open(RegisterComponent, {
      role: 'dialog',
      height: '480px',
      width: '480px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      const { firstName, lastName, email, password, avatar } = result;
      if (result != undefined) {
        this.authService.SignUp(email, password, firstName, lastName, avatar);
      } else {
        return;
      }
    });
  }
}
