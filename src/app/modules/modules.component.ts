import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { ConfigfileService } from '../configfile.service'
import { createRenderableModule, RenderableModule } from '../mmm-configuration-specification'

@Component({
  selector: 'app-root',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss'],
  providers: [ConfigfileService]
})
export class ModulesComponent {
  defaultModuleName = 'No Module Selected'
  moduleNames: string[]
  selectedModule: RenderableModule

  constructor(private configfileService: ConfigfileService) {
    this.clearSelected()
  }

  ngOnInit(): void {
    this.configfileService.getModules()
    .pipe(map(configs => configs.map(config => config.module)))
    .subscribe(names => {
      this.moduleNames = names
      this.clearSelected()
    })
  }

  async selectModule(moduleName) {
    if (this.defaultModuleName === moduleName) {
      this.clearSelected()
    } else if (this.selectModule.name !== moduleName) {
      this.selectedModule = await createRenderableModule(moduleName, this.configfileService)
    }
  }
  private clearSelected() {
    this.selectedModule = {
      canRender: false,
      name: this.defaultModuleName,
      config: undefined,
      spec: undefined,
      fields: undefined,
    }
  }
}
