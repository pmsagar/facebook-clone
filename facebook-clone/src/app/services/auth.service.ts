import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private defaultAvatar = 'assets/default-avatar.svg';
  private userData:Observable<firebase.default.User>;
  private currentUser:UserData;
  private currentUser$:BehaviorSubject<UserData> = new BehaviorSubject<UserData>(null);

  constructor(private afs:AngularFirestore,
    private afAuth:AngularFireAuth,
    private router:Router) {
      this.userData = afAuth.authState;
      this.userData.subscribe(user => {
        if(user)
        {
          this.afs.collection<UserData>('users')
          .doc<UserData>(user.uid)
          .valueChanges()
          .subscribe(currentUser => {
            if(currentUser != undefined)
            {

            this.currentUser = currentUser;
            this.currentUser$.next(this.currentUser);
            }
            else
            {
              this.currentUser = null;
            }
          })
        }
      })
    }


    CurrentUser():Observable<UserData>{
      return this.currentUser$.asObservable();
    }


    SignUp(email: string,
      password: string,
      firstName: string,
      lastName: string,
      avatar): void {
 this.afAuth.createUserWithEmailAndPassword(email, password)
   .then(res => {
     if(avatar == undefined || avatar == ''){
       avatar = this.defaultAvatar;
     }
     if (res) {
       this.afs.collection<UserData>('users').doc(res.user.uid)
         .set({
           firstName,
           lastName,
           email,
           avatar
         }).then(value => {
         this.afs.collection<UserData>('users')
           .doc<UserData>(res.user.uid)
           .valueChanges()
           .subscribe(user => {
             console.log(user);
             if (user) {
               this.currentUser$.next(user);
             }
           });

       });
     }
   })
   .catch(err => console.log(`Something went wrong ${err.message}`));
}

    get UserData():Observable<firebase.default.User>{
      return this.userData;
    }

    SignIn(email:string,password:string):void{
      this.afAuth.signInWithEmailAndPassword(email,password)
      .then(resp=>{
        this.userData = this.afAuth.authState;
        this.afs.collection<UserData>('users')
              .doc<UserData>(resp.user.uid)
              .valueChanges()
              .subscribe(user => {
                if(user){
                  this.currentUser = user;
                  this.currentUser$.next(this.currentUser);
                }
              });
      }).catch(err=>console.log(err));
    }

    LogOut():void{
this.afAuth.signOut()
.then(resp=>{
  this.currentUser = null;
  this.currentUser$.next(this.currentUser);
this.router.navigateByUrl('login').then();
})
    }


    searchUserInDatabase(user_id):Observable<UserData>{
      return this.afs.collection<UserData>('users')
      .doc<UserData>(user_id)
      .valueChanges();
    }



}

export interface UserData{
  firstName:string,
  lastName:string,
  avatar:string,
  email:string,
  id?:string
}
