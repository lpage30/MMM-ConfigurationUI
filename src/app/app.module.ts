
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileSaverModule } from 'ngx-filesaver'
import { HttpClientModule } from  '@angular/common/http';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { AppRoutingModule } from './app-routing.module';
import { ModulesComponent } from './modules/modules.component';
import { ModuleComponent } from './module/module.component';
import { RouterModule, Routes } from '@angular/router';
import { InputArrayComponent } from './input-array/input-array.component';
import { InputObjectComponent } from './input-object/input-object.component';
import { InputFieldComponent } from './input-field/input-field.component';

const appRoutes: Routes = [
  { path: 'modules', component: ModulesComponent, data: { title: 'Configured Modules' }},
  { path: 'module/:name',      component: ModuleComponent },
];

@NgModule({
  declarations: [
    ModulesComponent,
    ModuleComponent,
    InputArrayComponent,
    InputObjectComponent,
    InputFieldComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FileSaverModule,
    FormsModule,
    HttpClientModule,
    ScrollDispatchModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true }, // <-- debugging purposes only),
    ),
  ],
  providers: [],
  bootstrap: [ModulesComponent]
})
export class AppModule { }
