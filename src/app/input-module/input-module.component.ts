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

  constructor(private configfileService: ConfigfileService) { 
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
  async submit() {
    await saveRenderableModule(this.module, this.configfileService)
  }
}
