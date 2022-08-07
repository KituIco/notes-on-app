import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthService } from './services/auth.service';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SpaceDetailComponent } from './components/space-detail/space-detail.component';
import { PageDetailComponent } from './components/page-detail/page-detail.component';
import { SpaceHomeComponent } from './components/space-home/space-home.component';
import { PublicPageComponent } from './components/public-page/public-page.component';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthService]},
  { path: 'login', component: LoginComponent, canActivate: [AuthService]},
  { path: 'signup', component: SignupComponent, canActivate: [AuthService]},
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthService]},
  { path: 'pages/:pageId', component: PublicPageComponent},
  
  { path: 'workspaces/:workspaceId', component: SpaceDetailComponent, canActivate: [AuthService],
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', component: SpaceHomeComponent }, 
      { path: 'pages/:pageId', component: PageDetailComponent },
    ]
  },
  { path: '**', redirectTo:''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
