import { Component } from '@angular/core';
import { Router } from "@angular/router";
import { map } from 'rxjs/operators';
import { ConfigfileService } from '../configfile.service'

@Component({
  selector: 'app-root',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
  providers: [ConfigfileService]
})
export class ModulesComponent {
  defaultModuleName = 'No Module Selected'
  moduleNames: string[]
  constructor(
    private configfileService: ConfigfileService,
    private router: Router) { }

  ngOnInit(): void {
    this.configfileService.getModules()
    .pipe(map(configs => configs.map(config => config.module)))
    .subscribe(names => {
      this.moduleNames = names
    })
  }
  loadModuleConfig(event) {
    if (this.defaultModuleName === event.target.value) return
    this.router.navigateByUrl(`/module/${event.target.value}`)
      .then(data => console.info('NAVIGATED', event, data))
      .catch(error => console.error('NAVIGATE FAILED', event, error))
  }
}
