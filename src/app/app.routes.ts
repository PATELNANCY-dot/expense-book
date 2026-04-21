import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Create } from './create/create'; 
import { Login } from './login/login';
import { Register } from './register/register';
import { Settings } from './settings/settings';
import { MainHome } from './main-home/main-home'; 

export const routes: Routes = [

  { path: '', component: MainHome },
  { path: 'login', component: Login }, 
  { path: 'register', component: Register },
  { path: 'home', component: Home }, 
  { path: 'create', component: Create },
  { path: 'settings', component: Settings },
  { path: 'main-home', component: MainHome },


];
