import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigfileService } from './configfile.service'

@Component({
  selector: 'app-root',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
  providers: [ConfigfileService]
})
export class ModulesComponent {
  moduleNames: string[]
  constructor(private configfileService: ConfigfileService) { }

  ngOnInit(): void {
    this.configfileService.getModules()
    .pipe(map(configs => configs.map(config => config.module)))
    .subscribe(names => {
      this.moduleNames = names
    })
  }
}
