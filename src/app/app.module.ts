
import { BrowserModule } from '@angular/platform-browser';
import { ScrollDispatchModule } from '@angular/cdk/scrolling';
import { HttpClientModule } from  '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileSaverModule } from 'ngx-filesaver'
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
    NgbModule,
    ScrollDispatchModule,
  ],
  providers: [],
  bootstrap: [ModulesComponent]
})
export class AppModule { }
