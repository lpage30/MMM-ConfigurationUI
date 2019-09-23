import { Component, OnInit, Input } from '@angular/core';
import { ConfigfileService} from '../configfile.service'
import { createRenderableFields, getLongestName, getLongestValue, RenderableModule, saveRenderableModule } from '../mmm-configuration-specification'

@Component({
  selector: 'app-input-module',
  templateUrl: './input-module.component.html',
  styleUrls: ['./input-module.component.scss'],
  providers: [ConfigfileService]
})
export class InputModuleComponent implements OnInit {
  @Input() module: RenderableModule
  showRebuild: boolean
  showRestart: boolean

  constructor(private configfileService: ConfigfileService) {
    this.showRebuild = false
    this.showRestart = false
  }

  ngOnInit(): void {
  }
  getLongestName(): string {
    return getLongestName(this.module.fields)
  }
  getLongestValue(): string {
    return getLongestValue(this.module.fields)
  }
  reset(): void {
    this.module.fields = createRenderableFields([], this.module.spec, this.module.config)
  }
  
  async rebuild() {
    await this.configfileService.rebuild(this.module.name)
    this.showRestart = await this.configfileService.canRestart(this.module.name).toPromise()
  }
  async restart() {
    await this.configfileService.restart(this.module.name).toPromise()
  }
  async submit() {
    await saveRenderableModule(this.module, this.configfileService)
    this.showRebuild = await this.configfileService.canRebuild(this.module.name).toPromise()
    if (!this.showRebuild) {
      this.showRestart = await this.configfileService.canRestart(this.module.name).toPromise()
    }
  }
}
