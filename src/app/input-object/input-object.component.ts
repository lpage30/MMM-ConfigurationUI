import { Component, OnInit, Input } from '@angular/core';
import { getLongestName, getLongestValue, RenderableField } from '../mmm-configuration-specification';

@Component({
  selector: 'app-input-object',
  templateUrl: './input-object.component.html',
  styleUrls: ['./input-object.component.scss']
})
export class InputObjectComponent implements OnInit {
  @Input() fields: RenderableField[]

  constructor() { }

  ngOnInit() {
  }
  getLongestName(renderableFields: RenderableField[]): string {
    return getLongestName(renderableFields)
  }
  getLongestValue(renderableFields: RenderableField[]): string {
    return getLongestValue(renderableFields)
  }
 
}
