import { Component, OnInit } from '@angular/core';
import { ConfigfileService, ModuleConfiguration } from './configfile.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ConfigfileService]
})
export class AppComponent implements OnInit {
  title = 'MMM-ConfigurationUI';
  modules: ModuleConfiguration[]
  selectedModule: ModuleConfiguration
  
  constructor(private configfileService: ConfigfileService) { }

  getModuleConfigurations(): void {
    this.configfileService.getModules().subscribe(modules => this.modules = modules);
  }

  ngOnInit(): void {
    this.getModuleConfigurations()
  }
  onSelect(module: ModuleConfiguration): void {
    this.selectedModule = module
  }
}
