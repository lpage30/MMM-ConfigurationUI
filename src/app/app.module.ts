
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileSaverModule } from 'ngx-filesaver'
import { HttpClientModule } from  '@angular/common/http';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { AppRoutingModule } from './app-routing.module';
import { ModulesComponent } from './modules/modules.component';
import { InputModuleComponent } from './input-module/input-module.component';
import { InputArrayComponent } from './input-array/input-array.component';
import { InputObjectComponent } from './input-object/input-object.component';
import { InputFieldComponent } from './input-field/input-field.component';

@NgModule({
  declarations: [
    ModulesComponent,
    InputModuleComponent,
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
  ],
  providers: [],
  bootstrap: [ModulesComponent]
})
export class AppModule { }
