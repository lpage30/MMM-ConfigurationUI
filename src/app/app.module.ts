
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FileSaverModule } from 'ngx-filesaver'
import { HttpClientModule } from  '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { ModulesComponent } from './modules.component';
import { ModuleComponent } from './module.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { path: 'modules', component: ModulesComponent, data: { title: 'Configured Modules' }},
  { path: 'module/:name',      component: ModuleComponent },
];

@NgModule({
  declarations: [
    ModulesComponent,
    ModuleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FileSaverModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }, // <-- debugging purposes only),
    ),
  ],
  providers: [],
  bootstrap: [ModulesComponent]
})
export class AppModule { }
